ExcelInputDialog = Ext.extend(KettleTabDialog, {
	width: 700,
	height: 520,
	showPreview:true,
	title: 'Excel输入',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();

		this.initData = function() {
			var cell = this.getInitData();
			ExcelInputDialog.superclass.initData.apply(this, [cell]);
			
			this.wAccFilenames.setValue('Y' == cell.getAttribute('accept_filenames'));
			this.wErrorIgnored.setValue('Y' == cell.getAttribute('error_ignored'));
			
		};

		this.saveData = function(){
			var data = {};
			
			//file tab
			data.spreadsheet_type = this.wSpreadSheetType.getValue();
			data.file = Ext.encode(this.wFilenameList.getStore().toJson());
			data.accept_filenames = this.wAccFilenames.getValue() ? "Y" : "N";
			data.accept_stepname = this.wAccStep.getValue();
			data.accept_field = this.wAccField.getValue();
			
			//sheet tab
			data.sheets = Ext.encode(this.wSheetnameList.getStore().toJson());
			
			
			//content tab
			data.header = this.wHeader.getValue() ? "Y" : "N";
			data.noempty = this.wNoempty.getValue() ? "Y" : "N";
			data.stoponempty = this.wStoponempty.getValue() ? "Y" : "N";
			data.limit = this.wLimit.getValue();
			data.encoding = this.wEncoding.getValue();
			data.add_to_result_filenames = this.wAddResult.getValue() ? "Y" : "N";
			
			//error tab
			data.strict_types = this.wStrictTypes.getValue() ? "Y" : "N";
			data.error_ignored = this.wErrorIgnored.getValue() ? "Y" : "N";
			data.error_line_skipped = this.wSkipErrorLines.getValue() ? "Y" : "N";
			data.bad_line_files_destination_directory = this.wWarningDestDir.getValue();
			data.bad_line_files_extension = this.wWarningExt.getValue();
			data.error_line_files_destination_directory = this.wErrorDestDir.getValue();
			data.error_line_files_extension = this.wErrorExt.getValue();
			data.line_number_files_destination_directory = this.wLineNrDestDir.getValue();
			data.line_number_files_extension = this.wLineNrExt.getValue();
			
			// fields tab
			data.fields = Ext.encode(this.wFields.getStore().toJson());
			
			// other tab
			data.filefield = this.wInclFilenameField.getValue();
			data.sheetfield = this.wInclSheetnameField.getValue();
			data.sheetrownumfield = this.wInclSheetRownumField.getValue();
			data.rownumfield = this.wInclRownumField.getValue();
			
			data.shortFileFieldName = this.wShortFileFieldName.getValue();
			data.extensionFieldName = this.wExtensionFieldName.getValue();
			data.pathFieldName = this.wPathFieldName.getValue();
			data.sizeFieldName = this.wSizeFieldName.getValue();
			
			data.hiddenFieldName = this.wIsHiddenName.getValue();
			data.lastModificationTimeFieldName = this.wLastModificationTimeName.getValue();
			data.uriNameFieldName = this.wUriName.getValue();
			data.rootUriNameFieldName = this.wRootUriName.getValue();
			
			return data;
		};

		this.tabItems = [this.getFileTab(cell), this.getSheetTab(cell), this.getContentTab(cell), 
				this.getErrorTab(cell), this.getFieldsTab(cell), this.getOtherTab(cell), ];
		
		ExcelInputDialog.superclass.initComponent.call(this);
	},
	
	getFileTab: function(cell) {
		var wSpreadSheetType = this.wSpreadSheetType = new Ext.form.ComboBox({
			fieldLabel: '表格类型（引擎）',
			anchor: '-10',
			displayField: 'desc',
			valueField: 'code',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('excelSheetTypeStore'),
			value: cell.getAttribute('spreadsheet_type')
	    });

		var fileNameStore  = new Ext.data.JsonStore({
			idProperty: 'fileName',
			fields: ['name', 'filemask', 'exclude_filemask', 'file_required', 'include_subfolders'],
			data: Ext.decode(cell.getAttribute('file') || Ext.encode([]))
		});
		var wFilenameList = this.wFilenameList = new KettleEditorGrid({
			fieldLabel: '选中的文件',
			height: 180,
			region: 'center',
			anchor: '-10',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '添加文件', scope: this, handler: function() {
						var sheetType = wSpreadSheetType.getValue(), extension = 32;
						if('JXL' == sheetType) extension = 32;
						else if('POI' == sheetType) extension = 96;	//xls,xlsx都行
						else if('SAX_POI' == sheetType) extension = 64;
						else if('ODS' == sheetType) extension = 128;
						
						var dialog = new FileExplorerWindow({extension: extension});
						dialog.on('ok', function(path) {
							var store = fileNamegrid.getStore();
							fileNamegrid.stopEditing();
							store.insert(0, new store.recordType({name: path}));
							fileNamegrid.startEditing(0, 1);
							dialog.close();
						});
						dialog.show();						
					}
				});
				
				menu.insert(1, '-'); 
			},
			columns: [{
				header: '文件/目录', dataIndex: 'name', width: 250, editor: new Ext.form.TextField()
			},{
				header: '通配符', dataIndex: 'filemask', width: 60, editor: new Ext.form.TextField()
			},{
				header: '通配符号（排除）', dataIndex: 'exclude_filemask', width: 100, editor: new Ext.form.TextField()
			},{
				header: '要求', dataIndex: 'file_required', width: 70, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
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
				header: '包含子目录', dataIndex: 'include_subfolders', width: 80, renderer: function(v)
				{
					if(v == 'Y') 
						return '是'; 
					else if(v == 'N') 
						return '否';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: fileNameStore
		});
		
		var wAccStep = this.wAccStep = new Ext.form.ComboBox({
			fieldLabel: '从哪个步骤读文件名',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label')),
			value: cell.getAttribute('accept_stepname')
	    });
		var wAccField= this.wAccField = new Ext.form.ComboBox({
			fieldLabel: '保存文件名的字段',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label')),
			value: cell.getAttribute('accept_field')
		});
		
		var wAccFilenames = this.wAccFilenames = new Ext.form.Checkbox({fieldLabel: '从前面的步骤获取文件名', checked: true});
		wAccFilenames.on('check', function(cb, checked) {
			if(checked)
			{
				wAccStep.setDisabled(false);
				wAccField.setDisabled(false);

			}else{
				wAccStep.setDisabled(true);
				wAccField.setDisabled(true);
			}
		});
		
		return {
			xtype: 'KettleForm',
			title: '文件',
			autoScroll: true,
			bodyStyle: 'padding: 10px 5px',
			labelWidth: 170,
			items: [wSpreadSheetType, wFilenameList,{
				xtype: 'fieldset',
				title: '从前面的步骤获取文件名',
				items: [wAccFilenames, wAccStep, wAccField]
			}]
		};
	},
	
	getSheetTab: function(cell) {
		
		var sheetNameStore  = new Ext.data.JsonStore({
			idProperty: 'fileName',
			fields: ['name', 'startrow', 'startcol'],
			data: Ext.decode(cell.getAttribute('sheets') || Ext.encode([]))
		});
		var wSheetnameList = this.wSheetnameList = new KettleEditorGrid({
			fieldLabel: '要读取的工作表列表',
			height: 250,
			region: 'center',
			anchor: '-10',
			disabled: false,
			columns: [{
				header: '工作表名称', dataIndex: 'name', width: 250, editor: new Ext.form.TextField()
			},{
				header: '起始行', dataIndex: 'startrow', width: 120, editor: new Ext.form.TextField()
			},{
				header: '起始列', dataIndex: 'startcol', width: 120, editor: new Ext.form.TextField()
			}],
			store: sheetNameStore
		});
		
		return {
			xtype: 'KettleForm',
			title: '工作表',
			labelWidth: 130,
			items: wSheetnameList
		};
	},
	
	getContentTab: function(cell) {
		var wHeader = this.wHeader = new Ext.form.Checkbox({fieldLabel: '头部',anchor: '-10', checked: cell.getAttribute('header')  == 'Y'});
		var wNoempty = this.wNoempty = new Ext.form.Checkbox({fieldLabel: '没有空行',anchor: '-10', checked: cell.getAttribute('noempty')  == 'Y'});
		var wStoponempty = this.wStoponempty = new Ext.form.Checkbox({fieldLabel: '停在空记录',anchor: '-10', checked: cell.getAttribute('stoponempty')  == 'Y'});
		var wLimit = this.wLimit = new Ext.form.TextField({fieldLabel: '限制', flex: 1,anchor: '-10',  value: cell.getAttribute('limit')});
		
		var wEncoding = this.wEncoding = new Ext.form.ComboBox({
			fieldLabel: '编码',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus:true,
			store: Ext.StoreMgr.get('availableCharsetsStore'),
			value: cell.getAttribute('encoding')
		});
		
		var wAddResult = this.wAddResult = new Ext.form.Checkbox({fieldLabel: '添加文件名', flex: 1,anchor: '-10',  value: cell.getAttribute('add_to_result_filenames')  == 'Y'});
		
		return {
			xtype: 'KettleForm',
			title: '内容',
			autoScroll: true,
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
			items: [wHeader, wNoempty, wStoponempty, wLimit, wEncoding, wAddResult]
		};
	},
	
	getErrorTab: function(cell) {
		var wStrictTypes = this.wStrictTypes = new Ext.form.Checkbox({fieldLabel: '严格类型', flex: 1,anchor: '-10', checked: cell.getAttribute('strict_types')  == 'Y'});
		
		var wSkipErrorLines = this.wSkipErrorLines = new Ext.form.Checkbox({fieldLabel: '跳过错误行', flex: 1,anchor: '-10', checked: cell.getAttribute('errorLineSkipped')  == 'Y'});
		
		/// warn start
		var wWarningDestDir = this.wWarningDestDir = new Ext.form.TextField({fieldLabel: '告警文件目录', flex: 1, value: cell.getAttribute('bad_line_files_destination_directory')});
		var wWarningExt = this.wWarningExt = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('warningFilesExtension')});
		var wbvWarningDestDir = new Ext.Button({ text: '变量(V)...', handler: function() {
		}});
		var wbbWarningDestDir = new Ext.Button({ text: '浏览(B)...', handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wWarningDestDir.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		/// end
		
		
		/// error start
		var wErrorDestDir = this.wErrorDestDir = new Ext.form.TextField({fieldLabel: '错误文件目录', flex: 1, value: cell.getAttribute('errorFilesDestinationDirectory')});
		var wErrorExt = this.wErrorExt = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('errorFilesExtension')});
		var wbvErrorDestDir = new Ext.Button({ text: '变量(V)...', handler: function() {
		}});
		var wbbErrorDestDir = new Ext.Button({ text: '浏览(B)...', handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wErrorDestDir.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		///end
		
		var wLineNrDestDir = this.wLineNrDestDir = new Ext.form.TextField({fieldLabel: '失败行数文件目录', flex: 1, value: cell.getAttribute('lineNumberFilesDestinationDirectory')});
		var wLineNrExt = this.wLineNrExt = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('lineNumberFilesExtension')});
		var wbvLineNrDestDir = new Ext.Button({ text: '变量(V)...', handler: function() {
		}});
		var wbbLineNrDestDir = new Ext.Button({ text: '浏览(B)...', handler: function() {
			var dialog = new FileExplorerWindow();
			dialog.on('ok', function(path) {
				wLineNrDestDir.setValue(path);
				dialog.close();
			});
			dialog.show();
		}});
		
		
		var wErrorIgnored = this.wErrorIgnored = new Ext.form.Checkbox({fieldLabel: '忽略错误', checked: true});
		
		wErrorIgnored.on('check', function(cb, checked) {
			if (checked) {
				wSkipErrorLines.setDisabled(false);

				wWarningDestDir.setDisabled(false);
				wWarningExt.setDisabled(false);
				wbvWarningDestDir.setDisabled(false);
				wbbWarningDestDir.setDisabled(false);
				
				wErrorDestDir.setDisabled(false);
				wErrorExt.setDisabled(false);
				wbvErrorDestDir.setDisabled(false);
				wbbErrorDestDir.setDisabled(false);
				
				wLineNrDestDir.setDisabled(false);
				wLineNrExt.setDisabled(false);
				wbvLineNrDestDir.setDisabled(false);
				wbbLineNrDestDir.setDisabled(false);
			} else {
				wSkipErrorLines.setDisabled(true);

				wWarningDestDir.setDisabled(true);
				wWarningExt.setDisabled(true);
				wbvWarningDestDir.setDisabled(true);
				wbbWarningDestDir.setDisabled(true);
				
				wErrorDestDir.setDisabled(true);
				wErrorExt.setDisabled(true);
				wbvErrorDestDir.setDisabled(true);
				wbbErrorDestDir.setDisabled(true);
				
				wLineNrDestDir.setDisabled(true);
				wLineNrExt.setDisabled(true);
				wbvLineNrDestDir.setDisabled(true);
				wbbLineNrDestDir.setDisabled(true);
			}
		});
		
		return {
			xtype: 'KettleForm',
			title: '错误处理',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
			items: [wStrictTypes, wErrorIgnored, wSkipErrorLines, {
				xtype: 'compositefield',
				fieldLabel: '告警文件目录',
				anchor: '-10',
				items: [wWarningDestDir, {xtype: 'label', text: '扩展名'}, wWarningExt, wbvWarningDestDir, wbbWarningDestDir]
			},{
				xtype: 'compositefield',
				fieldLabel: '错误文件目录',
				anchor: '-10',
				items: [wErrorDestDir, {xtype: 'label', text: '扩展名'}, wErrorExt, wbvErrorDestDir, wbbErrorDestDir]
			},{
				xtype: 'compositefield',
				fieldLabel: '失败行数文件目录',
				anchor: '-10',
				items: [wLineNrDestDir, {xtype: 'label', text: '扩展名'}, wLineNrExt, wbvLineNrDestDir, wbbLineNrDestDir]
			}]
		};
	},
	
	getFieldsTab: function(cell) {
		var fieldStore = new Ext.data.JsonStore({
			fields: ['name', 'type', 'length', 'precision', 'trim_type', 'repeat', 'format', 'currency', 'decimal', 'group'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});

		var wFields = this.wFields = new KettleEditorGrid({
			region: 'center',
			title: '字段',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取来自头部数据的字段', scope: this, handler: function() {
						me.onSure();

						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(st) {
							store.loadData(st.toJson());
						});
					}
				});
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
					allowBlank: false
				})
			},{
				header: '类型', dataIndex: 'type', width: 50, editor: new Ext.form.ComboBox({
					store: Ext.StoreMgr.get('valueMetaStore'),
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true
				})
			},{
				header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: '精度', dataIndex: 'precision', width: 50, editor: new Ext.form.TextField()
			},{
				header: '去除空格类型', dataIndex: 'trim_type', width: 100, renderer: function(v)
				{
					if(v == 'none')
						return '不去掉空格';
					else if(v == 'left')
						return '去掉左空格';
					else if(v == 'right')
						return '去掉右空格';
					else if(v == 'both')
						return '去掉左右两端空格';
					return v;
				}, editor: new Ext.form.ComboBox({
					store: new Ext.data.JsonStore({
						fields: ['value', 'text'],
						data: [{value: 'none', text: '不去掉空格'},
							{value: 'left', text: '去掉左空格'},
							{value: 'right', text: '去掉右空格'},
							{value: 'both', text: '去掉左右两端空格'}]
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
				header: '重复', dataIndex: 'repeat', width: 50, editor: new Ext.form.TextField()

			},{
				header: '格式', dataIndex: 'format', width: 50, editor: new Ext.form.ComboBox({
					store: Ext.StoreMgr.get('valueFormatStore'),
					displayField:'name',
					valueField:'name',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus:true
				})
			},{
				header: '货币', dataIndex: 'currency', width: 50, editor: new Ext.form.TextField()
			},{
				header: '小数', dataIndex: 'decimal', width: 50, editor: new Ext.form.TextField()
			},{
				header: '分组', dataIndex: 'group', width: 50, editor: new Ext.form.TextField()
			}],
			store: fieldStore
		});
		
		return wFields;
	},
	
	getOtherTab: function (cell) {
		var wInclFilenameField = this.wInclFilenameField = new Ext.form.TextField({fieldLabel: '文件名称字段',anchor: '-10', value: cell.getAttribute('filefield')});
		var wInclSheetnameField = this.wInclSheetnameField = new Ext.form.TextField({fieldLabel: 'Sheet名称字段',anchor: '-10', value: cell.getAttribute('sheetfield')});
		var wInclSheetRownumField = this.wInclSheetRownumField = new Ext.form.TextField({fieldLabel: 'Sheet的行号列',anchor: '-10', value: cell.getAttribute('sheetrownumfield')});
		var wInclRownumField = this.wInclRownumField = new Ext.form.TextField({fieldLabel: '行号列',anchor: '-10', value: cell.getAttribute('rownumfield')});
		
		var wShortFileFieldName = this.wShortFileFieldName = new Ext.form.TextField({fieldLabel: '文件名字段',anchor: '-10', value: cell.getAttribute('shortFileFieldName')});
		var wExtensionFieldName = this.wExtensionFieldName = new Ext.form.TextField({fieldLabel: '扩展名字段',anchor: '-10', value: cell.getAttribute('extensionFieldName')});
		var wPathFieldName = this.wPathFieldName = new Ext.form.TextField({fieldLabel: '路径字段',anchor: '-10', value: cell.getAttribute('pathFieldName')});
		var wSizeFieldName = this.wSizeFieldName = new Ext.form.TextField({fieldLabel: '文件大小字段',anchor: '-10', value: cell.getAttribute('sizeFieldName')});
		
		var wIsHiddenName = this.wIsHiddenName = new Ext.form.TextField({fieldLabel: '是否为隐藏文件字段',anchor: '-10', value: cell.getAttribute('hiddenFieldName')});
		var wLastModificationTimeName = this.wLastModificationTimeName = new Ext.form.TextField({fieldLabel: '最后修改时间字段',anchor: '-10', value: cell.getAttribute('lastModificationTimeFieldName')});
		var wUriName = this.wUriName = new Ext.form.TextField({fieldLabel: 'Uri字段',anchor: '-10', value: cell.getAttribute('uriNameFieldName')});
		var wRootUriName = this.wRootUriName = new Ext.form.TextField({fieldLabel: 'Root uri字段',anchor: '-10', value: cell.getAttribute('rootUriNameFieldName')});
		
		return {
			xtype: 'KettleForm',
			title: '其他输出字段',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
			items: [wInclFilenameField, wInclSheetnameField, wInclSheetRownumField, wInclRownumField,
				wShortFileFieldName, wExtensionFieldName, wPathFieldName, wSizeFieldName,
				wIsHiddenName, wLastModificationTimeName, wUriName, wRootUriName]
		};
	}
});

Ext.reg('ExcelInput', ExcelInputDialog);