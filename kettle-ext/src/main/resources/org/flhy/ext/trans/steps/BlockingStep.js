BlockingStepDialog = Ext.extend(KettleDialog, {
	title: '阻塞数据',
	width: 450,
	height: 250,
	initComponent: function() {
		var wPassAllRows = new Ext.form.Checkbox({ fieldLabel: 'Pass all row?', checked: true});
		var wSpoolDir = new Ext.form.TextField({ flex: 1 });
		var wPrefix = new Ext.form.TextField({ fieldLabel: '临时文件前缀', anchor: '-10' });
		var wCacheSize = new Ext.form.TextField({ fieldLabel: '缓存大小', anchor: '-10' });
		var wCompress = new Ext.form.Checkbox({ fieldLabel: '压缩临时文件' });
		this.initData = function() {
			var cell = this.getInitData();
			BlockingStepDialog.superclass.initData.apply(this, [cell]);
			
			wPassAllRows.setValue('Y' == cell.getAttribute('pass_all_rows'));
			wSpoolDir.setValue(cell.getAttribute('directory'));
			wPrefix.setValue(cell.getAttribute('prefix'));
			wCacheSize.setValue(cell.getAttribute('cache_size'));
			wCompress.setValue('Y' == cell.getAttribute('compress'));
		};
		
		this.saveData = function(){
			var data = {};
			data.pass_all_rows = wPassAllRows.getValue() ? 'Y' : 'N';
			data.directory = wSpoolDir.getValue();
			data.prefix = wPrefix.getValue();
			data.cache_size = wCacheSize.getValue();
			data.compress = wCompress.getValue() ? 'Y' : 'N';
			return data;
		};
		
		wPassAllRows.on('check', function(cb, checked) {
			if(checked) {
				wSpoolDir.enable();
				wPrefix.enable();
				wCacheSize.enable();
				wCompress.enable();
			} else {
				wSpoolDir.disable();
				wPrefix.disable();
				wCacheSize.disable();
				wCompress.disable();
			}
		});
		
		this.fitItems = {
			xtype: 'KettleForm',
			height: 150,
			labelWidth: 120,
			items: [wPassAllRows, {
				xtype: 'compositefield',
				fieldLabel: '文件名',
				anchor: '-10',
				items:[wSpoolDir, {
					xtype: 'button', text: '浏览..', handler: function() {
						var dialog = new FileExplorerWindow();
						dialog.on('ok', function(path) {
							wSpoolDir.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}, wPrefix, wCacheSize, wCompress]
		};
		
		BlockingStepDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('BlockingStep', BlockingStepDialog);