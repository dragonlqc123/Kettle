UniqueRowsByHashSetDialog = Ext.extend(KettleDialog, {
	title: '去除重复记录',
	width: 600,
	height: 500,
	
	initComponent: function() {
		var me = this;
		
		var wStoreValues = new Ext.form.Checkbox({fieldLabel: '使用存储的记录值进行比较'});
		var wRejectDuplicateRow = new Ext.form.Checkbox({fieldLabel: '重定向重复记录'});
		var wErrorDesc = new Ext.form.TextField({fieldLabel: '错误描述', anchor: '-10', disabled: true});
		
		var store = new Ext.data.JsonStore({
			fields: ['name']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			UniqueRowsByHashSetDialog.superclass.initData.apply(this, [cell]);
			
			wStoreValues.setValue('Y' == cell.getAttribute('store_values'));
			wRejectDuplicateRow.setValue('Y' == cell.getAttribute('reject_duplicate_row'));
			wErrorDesc.setValue(cell.getAttribute('error_description'));
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.store_values = wStoreValues.getValue() ? 'Y' : 'N';
			data.reject_duplicate_row = wRejectDuplicateRow.getValue() ? 'Y' : 'N';
			data.error_description = wErrorDesc.getValue();
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		wRejectDuplicateRow.on('check', function(cb, checked) {
			if(checked === true)
				wErrorDesc.enable();
			else
				wErrorDesc.disable();
		});
		
		this.fitItems = {
			layout: 'border',
			border: false,
			items: [{
				xtype: 'KettleForm',
				region: 'north',
				height: 120,
				border: false,
				margins: '0 0 5 0',
				bodyStyle: 'padding: 0px',
				labelWidth: 160,
				items: [{
					xtype: 'fieldset',
					title: '设置',
					items: [wStoreValues, wRejectDuplicateRow, wErrorDesc]
				}]
			}, {
				title: '用来比较的字段',
				xtype: 'KettleEditorGrid',
				region: 'center',
				menuAdd: function(menu) {
					menu.insert(0, {
						text: '获取字段', scope: this, handler: function() {
							me.onSure(false);
							getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(s) {
								store.merge(s, ['name']);
							});
						}
					});
					
					menu.insert(1, '-');
				},
				getDefaultValue: function() {
					return {name: '' };
				},
				columns: [new Ext.grid.RowNumberer(), {
					header: '字段名称', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
						displayField: 'name',
						valueField: 'name',
						typeAhead: true,
				        forceSelection: true,
				        triggerAction: 'all',
				        selectOnFocus:true,
						store: getActiveGraph().inputFields(cell.getAttribute('label'))
					})
				}],
				store: store
			}]
		};
		
		UniqueRowsByHashSetDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('UniqueRowsByHashSet', UniqueRowsByHashSetDialog);