# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-17 19:53
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
import django.db.models.deletion
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('SPTGUI', '0015_auto_20170411_0407'),
    ]

    operations = [
        migrations.AddField(
            model_name='download',
            name='analysis',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='SPTGUI.Analysis'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='download',
            name='description',
            field=models.CharField(default='', max_length=400),
        ),
        migrations.AddField(
            model_name='download',
            name='pub_date',
            field=models.DateTimeField(default=datetime.datetime(2017, 4, 17, 19, 53, 59, 934122, tzinfo=utc), verbose_name='date created'),
            preserve_default=False,
        ),
    ]
