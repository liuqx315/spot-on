# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 15:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SPTGUI', '0007_auto_20170222_1529'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dataset',
            name='pre_npoints',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='dataset',
            name='pre_ntraces',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
