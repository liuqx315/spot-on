# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 15:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SPTGUI', '0006_auto_20170222_1348'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='pre_npoints',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dataset',
            name='pre_ntraces',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='dataset',
            name='parsed',
            field=models.FileField(blank=True, null=True, upload_to='uploads/'),
        ),
    ]
