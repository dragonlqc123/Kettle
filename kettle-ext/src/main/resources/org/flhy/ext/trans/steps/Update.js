UpdateDialog = Ext.extend(KettleTabDialog, {
	title: '更新',
	width: 600,
	height: 450,
	initComponent: function() {
		var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
		
		var wConnection = new Ext.form.ComboBox({
			flex: 1,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
	        store: getActiveGraph().getDatabaseStore()
		});
		
		var onDatabaseCreate = function(dialog) {
			getActiveGraph().onDatabaseMerge(dialog.getValue());
            wConnection.setValue(dialog.getValue().name);
            dialog.close();
		};
		
		var wSchema = new Ext.form.TextField({ flex: 1});
		var wTable = new Ext.form.TextField({ flex: 1});
		var wCommit = new Ext.form.TextField({ fieldLabel: '提交记录数量', anchor: '-10'});
		var wBatch = new Ext.form.Checkbox({ fieldLabel: '批量更新'});
		var wSkipLookup = new Ext.form.Checkbox({ fieldLabel: '跳过查询' });
		var wIgnore = new Ext.form.Checkbox({ fieldLabel: '忽略查询失败', checked: true});
		var wIgnoreFlagField = new Ext.form.TextField({ fieldLabel: '标志字段(key found)', anchor: '-10'});
		
		var searchStore = new Ext.data.JsonStore({
			fields: ['field', 'condition', 'name', 'name2'],
			data: Ext.decode(cell.getAttribute('searchFields')) || []
		});
		var updateStore = new Ext.data.JsonStore({
			fields: ['name', 'rename'],
			data: Ext.decode(cell.getAttribute('updateFields')) || []
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			UpdateDialog.superclass.initData.apply(this, [cell]);
			
			wConnection.setValue(cell.getAttribute('connection'));
			wSchema.setValue(cell.getAttribute('schema'));
			wTable.setValue(cell.getAttribute('table'));
			wCommit.setValue(cell.getAttribute('commit'));
			wIgnoreFlagField.setValue(cell.getAttribute('ignore_flag_field'));
			
			wBatch.setValue('Y' == cell.getAttribute('use_batch'));
			wSkipLookup.setValue('Y' == cell.getAttribute('skip_lookup'));
			wIgnore.setValue('Y' == cell.getAttribute('error_ignored'));
			
			searchStore.loadData(Ext.decode(cell.getAttribute('searchFields')));
			updateStore.loadData(Ext.decode(cell.getAttribute('updateFields')));
		};
		
		this.saveData = function(){
			var data = {};
			data.connection = wConnection.getValue();
			data.schema = wSchema.getValue();
			data.table = wTable.getValue();
			data.commit = wCommit.getValue();
			data.ignore_flag_field = wIgnoreFlagField.getValue();
			
			data.use_batch = wBatch.getValue() ? 'Y' : 'N';
			data.skip_lookup = wSkipLookup.getValue() ? 'Y' : 'N';
			data.error_ignored = wIgnore.getValue() ? 'Y' : 'N';
			
			data.searchFields = Ext.encode(searchStore.toJson());
			data.updateFields = Ext.encode(updateStore.toJson());
			
			return data;
		};
		
		wIgnore.on('check', function(cb, checked) {
			if(checked) {
				wIgnoreFlagField.enable();
			} else {
				wIgnoreFlagField.disable();
			}
		});
		
		this.tabItems = [{
			title: '基本配置',
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 150,
			items: [{
				xtype: 'compositefield',
				fieldLabel: '数据库连接',
				anchor: '-10',
				items: [wConnection, {
					xtype: 'button', text: '编辑...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initTransDatabase(wConnection.getValue());
						});
					}
				}, {
					xtype: 'button', text: '新建...', handler: function() {
						var databaseDialog = new DatabaseDialog();
						databaseDialog.on('create', onDatabaseCreate);
						databaseDialog.show(null, function() {
							databaseDialog.initTransDatabase(null);
						});
					}
				}, {
					xtype: 'button', text: '向导...'
				}]
			},{
				fieldLabel: '目的模式',
				xtype: 'compositefield',
				anchor: '-10',
				items: [wSchema, {
					xtype: 'button', text: '浏览...', handler: function() {
						me.selectSchema(wConnection, wSchema);
					}
				}]
			},{
				fieldLabel: '目标表',
				xtype: 'compositefield',
				anchor: '-10',
				items: [wTable, {
					xtype: 'button', text: '浏览...', handler: function() {
						me.selectTable(wConnection, wSchema, wTable);
					}
				}]
			}, wCommit, wBatch, wSkipLookup, wIgnore, wIgnoreFlagField]
		}, {
			title: '查询字段',
			xtype: 'KettleEditorGrid',
			region: 'center',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', handler: function() {
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
							searchStore.merge(store, [{name: 'field', value: ''}, {name:'condition', value:'='}, 'name', {name: 'name2', value: ''}]);
						});
					}
				});
				
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'field', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
			        editable: true,
					store: this.getTableColumns(wConnection, wSchema, wTable),
					listeners : {
					     beforequery: function(qe){
					    	 delete qe.combo.lastQuery;
					     }
					} 
				})
			},{
				header: '比较符', dataIndex: 'condition', width: 100, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: '=', text: '='},
			        	       {value: '<>', text: '<>'},
			        	       {value: '<', text: '<'},
			        	       {value: '<=', text: '<='},
			        	       {value: '>', text: '>'},
			        	       {value: '>=', text: '>='},
			        	       {value: 'LIKE', text: 'LIKE'},
			        	       {value: 'BETWEEN', text: 'BETWEEN'},
			        	       {value: 'IS NULL', text: 'IS NULL'},
			        	       {value: 'IS NOT NULL', text: 'IS NOT NULL'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: '流里的字段1', dataIndex: 'name', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					editable: true,
					typeAhead: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: '流里的字段2', dataIndex: 'name2', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					editable: true,
					typeAhead: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			}],
			store: searchStore
		}, {
			title: '更新字段',
			xtype: 'KettleEditorGrid',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', handler: function() {
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
							updateStore.merge(store, [{name: 'name', value: ''}, {name:'rename', field: 'name'}]);
						});
					}
				});
				
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '表字段', dataIndex: 'name', width: 200, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					editable: true,
					typeAhead: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: this.getTableColumns(wConnection, wSchema, wTable),
					listeners : {
					     beforequery: function(qe){
					    	 delete qe.combo.lastQuery;
					     }
					} 
				})
			},{
				header: '流字段', dataIndex: 'rename', width: 200, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					editable: true,
					typeAhead: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			}],
			store: updateStore
		}];
		
		UpdateDialog.superclass.initComponent.call(this);
	},
	
	getTableColumns: function(wConnection, wSchema, wTable) {
		var store = getActiveGraph().tableFields();	// update 20180806
		store.on('beforeload', function() {
			store.baseParams.databaseName = wConnection.getValue();
			store.baseParams.schema = wSchema.getValue();
			store.baseParams.table = wTable.getValue();
		});
		return store;
	},
	
	selectSchema: function(wConnection, wSchema) {
		var store = getActiveGraph().getDatabaseStore();
		store.each(function(item) {
			if(item.get('name') == wConnection.getValue()) {
				var dialog = new DatabaseExplorerDialog({includeElement: 1});
				dialog.on('select', function(schema) {
					wSchema.setValue(schema);
					dialog.close();
				});
				dialog.show(null, function() {
					dialog.initDatabase(item.json);
				});
				return false;
			}
		});
	},
	
	selectTable: function(wConnection, wSchema, wTable) {
		var store = getActiveGraph().getDatabaseStore();
		store.each(function(item) {
			if(item.get('name') == wConnection.getValue()) {
				var dialog = new DatabaseExplorerDialog();
				dialog.on('select', function(table, schema) {
					wTable.setValue(table);
					wSchema.setValue(schema);
					dialog.close();
				});
				dialog.show(null, function() {
					dialog.initDatabase(item.json);
				});
				return false;
			}
		});
	}
});

Ext.reg('Update', UpdateDialog);