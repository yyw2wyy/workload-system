from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
import os
import sys
import subprocess

class Command(BaseCommand):
    help = '在执行数据库迁移之前自动备份数据库'

    def add_arguments(self, parser):
        # 添加可选参数
        parser.add_argument(
            '--skip-backup',
            action='store_true',
            help='跳过数据库备份直接执行迁移'
        )

    def handle(self, *args, **options):
        if not options['skip_backup']:
            # 获取项目根目录
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            
            # 执行备份
            self.stdout.write('正在备份数据库...')
            backup_script = os.path.join(project_root, 'backup_db.py')
            
            if not os.path.exists(backup_script):
                self.stderr.write(self.style.ERROR('备份脚本不存在！'))
                if not self.confirm('是否继续执行迁移？'):
                    self.stdout.write('操作已取消')
                    return
            
            try:
                # 使用subprocess替代os.system以获取更好的错误处理
                result = subprocess.run(
                    [sys.executable, backup_script, 'backup'],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode != 0:
                    self.stderr.write(self.style.ERROR('数据库备份失败！'))
                    self.stderr.write(self.style.ERROR(f'错误信息: {result.stderr}'))
                    if not self.confirm('是否继续执行迁移？'):
                        self.stdout.write('操作已取消')
                        return
                else:
                    self.stdout.write(self.style.SUCCESS('数据库备份成功！'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'执行备份脚本时出错: {e}'))
                if not self.confirm('是否继续执行迁移？'):
                    self.stdout.write('操作已取消')
                    return
        
        # 执行迁移
        self.stdout.write('正在执行数据库迁移...')
        try:
            call_command('migrate', interactive=True)
            self.stdout.write(self.style.SUCCESS('数据库迁移完成！'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'迁移过程中出错: {e}'))
            sys.exit(1)

    def confirm(self, question):
        """询问用户是否继续"""
        while True:
            answer = input(f"\n{question} [y/N]: ").lower().strip()
            if answer in ('y', 'yes'):
                return True
            elif answer in ('n', 'no', ''):
                return False 