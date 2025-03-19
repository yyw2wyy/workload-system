import os
import time
import shutil
import subprocess
from datetime import datetime
import json
import sys

# 配置信息
CONFIG = {
    'DB_NAME': 'workload',  # 数据库名称
    'BACKUP_DIR': 'db_backups',  # 备份目录
    'MAX_BACKUPS': 10,  # 保留的最大备份数量
}

def ensure_backup_dir():
    """确保备份目录存在"""
    if not os.path.exists(CONFIG['BACKUP_DIR']):
        os.makedirs(CONFIG['BACKUP_DIR'])

def setup_django():
    """设置Django环境"""
    import django
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
    django.setup()

def get_mysql_credentials():
    """从 Django settings 中获取 MySQL 配置"""
    try:
        setup_django()
        from mysite.settings import DATABASES
        db_config = DATABASES['default']
        return {
            'host': db_config.get('HOST', 'localhost'),
            'user': db_config.get('USER', 'root'),
            'password': db_config.get('PASSWORD', ''),
            'port': db_config.get('PORT', '3306'),
            'database': db_config.get('NAME', CONFIG['DB_NAME'])
        }
    except Exception as e:
        print(f"无法读取 Django 配置: {e}")
        return None

def create_backup():
    """创建数据库备份"""
    ensure_backup_dir()
    
    # 获取数据库配置
    db_config = get_mysql_credentials()
    if not db_config:
        print("错误：无法获取数据库配置")
        return False

    # 生成备份文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(CONFIG['BACKUP_DIR'], f"backup_{timestamp}.sql")
    
    # 构建 mysqldump 命令
    cmd = [
        'mysqldump',
        f"--host={db_config['host']}",
        f"--user={db_config['user']}",
        f"--port={db_config['port']}",
        '--single-transaction',
        '--quick',
        '--no-tablespaces',  # 添加此选项避免需要PROCESS权限
        '--skip-lock-tables',
        db_config['database']
    ]

    if db_config['password']:
        cmd.extend(['-p' + db_config['password']])  # 使用更安全的密码传递方式

    try:
        # 执行备份
        with open(backup_file, 'w', encoding='utf-8') as f:
            subprocess.run(cmd, stdout=f, check=True, stderr=subprocess.PIPE)
        
        print(f"数据库备份成功: {backup_file}")
        
        # 保存配置信息
        config_file = f"{backup_file}.json"
        migrations = get_current_migrations()
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump({
                'database': db_config['database'],
                'timestamp': timestamp,
                'django_migrations': migrations
            }, f, ensure_ascii=False, indent=2)
        
        # 清理旧备份
        cleanup_old_backups()
        return True
    except subprocess.CalledProcessError as e:
        print(f"备份失败: {e}")
        print(f"错误输出: {e.stderr.decode() if e.stderr else '无'}")
        return False
    except Exception as e:
        print(f"备份过程中出错: {e}")
        return False

def restore_backup(backup_file):
    """从备份文件恢复数据库"""
    if not os.path.exists(backup_file):
        print(f"错误：备份文件不存在: {backup_file}")
        return False

    db_config = get_mysql_credentials()
    if not db_config:
        print("错误：无法获取数据库配置")
        return False

    try:
        # 构建 mysql 命令
        cmd = [
            'mysql',
            f"--host={db_config['host']}",
            f"--user={db_config['user']}",
            f"--port={db_config['port']}",
            db_config['database']
        ]

        if db_config['password']:
            cmd.extend(['-p' + db_config['password']])

        # 执行恢复
        with open(backup_file, 'r', encoding='utf-8') as f:
            subprocess.run(cmd, stdin=f, check=True, stderr=subprocess.PIPE)
        
        print(f"数据库恢复成功: {backup_file}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"恢复失败: {e}")
        print(f"错误输出: {e.stderr.decode() if e.stderr else '无'}")
        return False
    except Exception as e:
        print(f"恢复过程中出错: {e}")
        return False

def get_current_migrations():
    """获取当前的迁移记录"""
    try:
        setup_django()
        from django.db import connections
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT app, name FROM django_migrations")
            return {row[0]: row[1] for row in cursor.fetchall()}
    except Exception as e:
        print(f"获取迁移记录失败: {e}")
        return {}

def cleanup_old_backups():
    """清理旧的备份文件，只保留最近的几个"""
    backup_files = []
    for f in os.listdir(CONFIG['BACKUP_DIR']):
        if f.startswith('backup_') and f.endswith('.sql'):
            backup_files.append(os.path.join(CONFIG['BACKUP_DIR'], f))
    
    # 按修改时间排序
    backup_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    # 删除超出数量的旧备份
    for old_backup in backup_files[CONFIG['MAX_BACKUPS']:]:
        try:
            os.remove(old_backup)
            config_file = f"{old_backup}.json"
            if os.path.exists(config_file):
                os.remove(config_file)
            print(f"已删除旧备份: {old_backup}")
        except Exception as e:
            print(f"删除旧备份失败: {e}")

def list_backups():
    """列出所有可用的备份"""
    ensure_backup_dir()
    backups = []
    
    for f in os.listdir(CONFIG['BACKUP_DIR']):
        if f.startswith('backup_') and f.endswith('.sql'):
            backup_path = os.path.join(CONFIG['BACKUP_DIR'], f)
            config_file = f"{backup_path}.json"
            
            backup_info = {
                'file': backup_path,
                'size': os.path.getsize(backup_path),
                'date': datetime.fromtimestamp(os.path.getmtime(backup_path))
            }
            
            if os.path.exists(config_file):
                try:
                    with open(config_file, 'r', encoding='utf-8') as cf:
                        backup_info.update(json.load(cf))
                except:
                    pass
                    
            backups.append(backup_info)
    
    return sorted(backups, key=lambda x: x['date'], reverse=True)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python backup_db.py [backup|restore|list]")
        sys.exit(1)

    command = sys.argv[1]
    
    if command == 'backup':
        create_backup()
    elif command == 'restore':
        if len(sys.argv) < 3:
            print("请指定要恢复的备份文件")
            sys.exit(1)
        restore_backup(sys.argv[2])
    elif command == 'list':
        backups = list_backups()
        print("\n可用的备份文件:")
        for backup in backups:
            size_mb = backup['size'] / (1024 * 1024)
            print(f"\n文件: {backup['file']}")
            print(f"大小: {size_mb:.2f}MB")
            print(f"日期: {backup['date'].strftime('%Y-%m-%d %H:%M:%S')}")
            if 'django_migrations' in backup:
                print("迁移记录: 已保存")
    else:
        print("无效的命令。可用命令: backup, restore, list") 