# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-06-14 21:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SPTGUI', '0022_dataset_import_report'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysis',
            name='editable',
            field=models.BooleanField(default=True),
        ),
    ]