AbortDialog = Ext.extend(KettleDialog, {
	title: '终止',
	width: 400,
	height: 220,
	initComponent: function() {
		var wRowThreshold = new Ext.form.TextField({ fieldLabel: '终止记录值', anchor: '-10' });
		var wMessage = new Ext.form.TextField({ fieldLabel: '终止信息', anchor: '-10' });
		var wAlwaysLogRows = new Ext.form.Checkbox({ fieldLabel: '总是记录行' });
		
		this.initData = function() {
			var cell = this.getInitData();
			AbortDialog.superclass.initData.apply(this, [cell]);
			
			wRowThreshold.setValue(cell.getAttribute('row_threshold'));
			wMessage.setValue(cell.getAttribute('message'));
			wAlwaysLogRows.setValue('Y' == cell.getAttribute('always_log_rows'));
		};
		
		this.saveData = function(){
			var data = {};
			data.row_threshold = wRowThreshold.getValue();
			data.message = wMessage.getValue();
			data.always_log_rows = wAlwaysLogRows.getValue() ? 'Y' : 'N';
			
			return data;
		};
		
		this.fitItems = {
			border: false,
			items: [{
				xtype: 'KettleForm',
				labelWidth: 100,
				items: [wRowThreshold, wMessage, wAlwaysLogRows]
			}]
		};
		
		AbortDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('Abort', AbortDialog);