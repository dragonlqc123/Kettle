SetValueFieldDialog = Ext.extend(KettleDialog, {
	title: '去除重复记录',
	width: 350,
	height: 300,
	
	initComponent: function() {
		var me = this;
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'replaceby']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			SetValueFieldDialog.superclass.initData.apply(this, [cell]);
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.fields = Ext.encode(store.toJson());
			
			return data;
		};
		
		this.fitItems = {
			title: '字段',
			xtype: 'KettleEditorGrid',
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
				return {name: '', case_insensitive: 'N' };
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
			}, {
				header: 'Replace by value from field', dataIndex: 'name', width: 120, editor: new Ext.form.ComboBox({
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
		};
		
		SetValueFieldDialog.superclass.initComponent.call(this);
	}
	
});

Ext.reg('SetValueField', SetValueFieldDialog);