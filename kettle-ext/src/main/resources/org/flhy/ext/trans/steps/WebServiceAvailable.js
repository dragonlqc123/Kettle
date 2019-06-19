WebServiceAvailableDialog = Ext.extend(KettleDialog, {
	title: '校验Web服务是否可用',
	width: 450,
	height: 250,
	initComponent: function() {
		var graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		var wURL= this.wURL = new Ext.form.ComboBox({
			fieldLabel: 'URL字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label'))
		});
		
		var wConnectTimeOut = new Ext.form.TextField({ fieldLabel: 'Connect', anchor: '-10' });
		var wReadTimeOut = new Ext.form.TextField({ fieldLabel: 'Read timeout(ms)', anchor: '-10' });
		var wResult = new Ext.form.TextField({ fieldLabel: 'Result Fieldname', anchor: '-10' });
		
		
		this.initData = function() {
			var cell = this.getInitData();
			WebServiceAvailableDialog.superclass.initData.apply(this, [cell]);
			
			wURL.setValue(cell.getAttribute('urlField'));
			wConnectTimeOut.setValue(cell.getAttribute('connectTimeOut'));
			wReadTimeOut.setValue(cell.getAttribute('readTimeOut'));
			wResult.setValue(cell.getAttribute('resultfieldname'));
		};
		
		this.saveData = function(){
			var data = {};
			data.urlField = wURL.getValue();
			data.connectTimeOut = wConnectTimeOut.getValue();
			data.readTimeOut = wReadTimeOut.getValue();
			data.resultfieldname = wResult.getValue();
			return data;
		};
		
		this.fitItems = {
			xtype: 'KettleForm',
			height: 150,
			labelWidth: 120,
			items: [wURL, wConnectTimeOut, wReadTimeOut, wResult]
		};
		
		WebServiceAvailableDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('WebServiceAvailable', WebServiceAvailableDialog);