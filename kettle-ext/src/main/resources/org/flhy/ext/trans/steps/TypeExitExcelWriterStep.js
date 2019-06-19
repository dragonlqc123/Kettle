ExcelWriterStepDialog = Ext.extend(KettleTabDialog, {
	title: '校验Web服务是否可用',
	width: 700,
	height: 620,
	initComponent: function() {
		var graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		
		this.initData = function() {
			var cell = this.getInitData();
			ExcelWriterStepDialog.superclass.initData.apply(this, [cell]);
			
			this.wSpecifyFormat.setValue(cell.getAttribute('file_SpecifyFormat') == 'Y');
			this.wExtension.setValue(cell.getAttribute('file_extention'));
			this.wProtectSheet.setValue(cell.getAttribute('protect_sheet') == 'Y');
			this.wTemplate.setValue(cell.getAttribute('template_enabled') == 'Y');
			this.wTemplateSheet.setValue(cell.getAttribute('template_sheet_enabled') == 'Y');
			
		};
		
		this.saveData = function(){
			var data = {};
			
			data.file_name = this.wFilename.getValue();
			data.file_extention = this.wExtension.getValue();
			data.file_stream_data = this.wStreamData.getValue() ? 'Y' : "N";
			data.file_splitevery = this.wSplitEvery.getValue();
			data.file_split = this.wAddStepnr.getValue() ? 'Y' : "N";
			data.file_add_date = this.wAddDate.getValue() ? 'Y' : "N";
			data.file_add_time = this.wAddTime.getValue() ? 'Y' : "N";
			data.file_SpecifyFormat = this.wSpecifyFormat.getValue() ? 'Y' : "N";
			data.file_date_time_format = this.wDateTimeFormat.getValue();
			data.if_file_exists = this.wIfFileExists.getValue();
			data.do_not_open_newfile_init = this.wDoNotOpenNewFileInit.getValue() ? 'Y' : "N";
			data.add_to_result_filenames = this.wAddToResult.getValue() ? 'Y' : "N";
			
			data.template_enabled = this.wTemplate.getValue() ? 'Y' : "N";
			data.template_filename = this.wTemplateFilename.getValue();
			data.template_sheet_enabled = this.wTemplateSheet.getValue() ? 'Y' : "N";
			data.template_sheetname = this.wTemplateSheetname.getValue();
			
			data.sheetname = this.wSheetname.getValue();
			data.makeSheetActive = this.wMakeActiveSheet.getValue() ? 'Y' : "N";
			data.if_sheet_exists = this.wIfSheetExists.getValue();
			data.protect_sheet = this.wProtectSheet.getValue() ? 'Y' : "N";
			data.protected_by = this.wProtectedBy.getValue();
			data.password = this.wPassword.getValue();
			
			
			// tab2
			data.startingCell = this.wStartingCell.getValue();
			data.rowWritingMethod = this.wRowWritingMethod.getValue();
			data.header = this.wHeader.getValue() ? 'Y' : "N";
			data.footer = this.wFooter.getValue() ? 'Y' : "N";
			data.autosizecolums = this.wAutoSize.getValue() ? 'Y' : "N";
			data.forceFormulaRecalculation = this.wForceFormulaRecalculation.getValue() ? 'Y' : "N";
			data.leaveExistingStylesUnchanged = this.wLeaveExistingStylesUnchanged.getValue() ? 'Y' : "N";
			
			data.appendLines = this.wAppendLines.getValue() ? 'Y' : "N";
			data.appendOffset = this.wSkipRows.getValue();
			data.appendEmpty = this.wEmptyRows.getValue();
			data.appendOmitHeader = this.wOmitHeader.getValue() ? 'Y' : "N";
			
			data.fields = Ext.encode(this.wFields.getStore().toJson());
			
			return data;
		};
		
		this.tabItems = [this.getFileTab(cell), this.getSheetTab(cell), this.getContentTab(cell)];
		
		ExcelWriterStepDialog.superclass.initComponent.call(this);
	},
	
	getFileTab: function(cell) {
		var wFilename = this.wFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('file_name')});
		
		var wExtension = this.wExtension = new Ext.form.ComboBox({
			fieldLabel: '扩展名',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('excelTypeStore')
	    });
		
		var wStreamData = this.wStreamData = new Ext.form.Checkbox({fieldLabel: 'Stream XSLX data', checked: cell.getAttribute('file_stream_data') == 'Y'});
		var wSplitEvery = this.wSplitEvery = new Ext.form.TextField({fieldLabel: '分割每...行数据', anchor: '-10', value: cell.getAttribute('file_splitevery')});
		var wAddStepnr = this.wAddStepnr = new Ext.form.Checkbox({fieldLabel: '文件名里包含步骤数', checked: cell.getAttribute('file_add_stepnr') == 'Y'});
		var wAddDate = this.wAddDate = new Ext.form.Checkbox({fieldLabel: '文件名里包含日期', checked: cell.getAttribute('file_add_date') == 'Y'});
		var wAddTime = this.wAddTime = new Ext.form.Checkbox({fieldLabel: '文件名里包含时间', checked: cell.getAttribute('file_add_time') == 'Y'});
		var wSpecifyFormat = this.wSpecifyFormat = new Ext.form.Checkbox({fieldLabel: '指定日期时间格式', checked: true});
		var wDateTimeFormat = this.wDateTimeFormat = new Ext.form.ComboBox({
			fieldLabel: '时间日期格式',
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('datetimeFormatStore'),
			value: cell.getAttribute('file_date_time_format')
		});
		wSpecifyFormat.on('check', function(cb, checked) {
			if(checked)
			{
				wDateTimeFormat.setDisabled(false);

			}else{
				wDateTimeFormat.setDisabled(true);
			}
		});
		var wIfFileExists = this.wIfFileExists = new Ext.form.ComboBox({
			fieldLabel: '如果输出文件中已存在工作表',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('excelwritemethodStore'),
			value: cell.getAttribute('if_sheet_exists')
		});
		var wDoNotOpenNewFileInit = this.wDoNotOpenNewFileInit = new Ext.form.Checkbox({fieldLabel: '在接收到数据前不创建文件', checked: cell.getAttribute('do_not_open_newfile_init') == 'Y'});
		var wAddToResult = this.wAddToResult = new Ext.form.Checkbox({fieldLabel: '结果中添加文件名', checked: cell.getAttribute('add_to_result_filenames') == 'Y'});
		
		var wTemplate = this.wTemplate = new Ext.form.Checkbox({fieldLabel: '使用模板创建新文件', checked: true});
		var wTemplateFilename = this.wTemplateFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('template_filename')});
		var wTemplateSheet = this.wTemplateSheet = new Ext.form.Checkbox({fieldLabel: '使用模板创建新工作表', checked: true});
		var wTemplateSheetname = this.wTemplateSheetname = new Ext.form.TextField({fieldLabel: '模板工作表', anchor: '-10', value: cell.getAttribute('template_sheetname')});
		
		wTemplate.on('check', function(cb, checked) {
			if(checked)
			{
				wTemplateFilename.enable();

			}else{
				wTemplateFilename.disable();
			}
		});
		wTemplateSheet.on('check', function(cb, checked) {
			if(checked)
			{
				wTemplateSheetname.enable();

			}else{
				wTemplateSheetname.disable();
			}
		});
		
		return {
			xtype: 'KettleForm',
			title: '文件',
			labelWidth: 130,
			bodyStyle: 'padding: 5px 5px',
			items: [{
				xtype: 'compositefield',
				fieldLabel: '文件名',
				anchor: '-10',
				items: [wFilename, {
					xtype: 'button', text: '浏览..', handler: function() {
						var dialog = new FileExplorerWindow();
						dialog.on('ok', function(path) {
							wFilename.setValue(path);
							dialog.close();
						});
						dialog.show();
					}
				}]
			}, wExtension, wStreamData, wSplitEvery, wAddStepnr, wAddDate, wAddTime, 
				wSpecifyFormat, wDateTimeFormat, wIfFileExists, wDoNotOpenNewFileInit, wAddToResult, {
				xtype: 'fieldset',
				title: '模板',
				items: [wTemplate, {
					xtype: 'compositefield',
					fieldLabel: '文件名',
					anchor: '-10',
					items: [wTemplateFilename, {
						xtype: 'button', text: '浏览..', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wTemplateFilename.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}, wTemplateSheet, wTemplateSheetname]
			}]
		};
	},
	
	getSheetTab: function(cell) {
		
		var wSheetname = this.wSheetname = new Ext.form.TextField({fieldLabel: 'Sheet名称', anchor: '-10', value: cell.getAttribute('sheetname')});
		var wMakeActiveSheet = this.wMakeActiveSheet = new Ext.form.Checkbox({fieldLabel: '设为活动Sheet', checked: cell.getAttribute('makeSheetActive') == 'Y'});
		var wIfSheetExists = this.wIfSheetExists = new Ext.form.ComboBox({
			fieldLabel: '如果输出文件中已存在工作表',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('excelwritemethodStore'),
			value: cell.getAttribute('if_sheet_exists')
		});
		var wProtectSheet = this.wProtectSheet = new Ext.form.Checkbox({fieldLabel: '保护工作表', disabled: cell.getAttribute('file_extention') == 'xlsx', checked: true});
		var wProtectedBy = this.wProtectedBy = new Ext.form.TextField({fieldLabel: '保护人', anchor: '-10', value: cell.getAttribute('protected_by')});
		var wPassword = this.wPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('password')});
		
		this.wExtension.on('change', function(cb, val) {
			if(val == 'xls') {
				wProtectSheet.enable();
			} else {
				wProtectSheet.setValue(false);
				wProtectSheet.disable();
			}
		});
		
		wProtectSheet.on('check', function(cb, checked) {
			if(checked)
			{
				wProtectedBy.enable();
				wPassword.enable();

			}else{
				wProtectedBy.disable();
				wPassword.disable();
			}
		});
		
		var wStartingCell = this.wStartingCell = new Ext.form.TextField({fieldLabel: '开始输出自单元格', anchor: '-10', value: cell.getAttribute('startingCell')});
		var wRowWritingMethod = this.wRowWritingMethod = new Ext.form.ComboBox({
			fieldLabel: '当输出记录时',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('excelrowwritemethodStore'),
			value: cell.getAttribute('rowWritingMethod')
		});
		var wHeader = this.wHeader = new Ext.form.Checkbox({fieldLabel: '头部', checked: cell.getAttribute('header') == 'Y'});
		var wFooter = this.wFooter = new Ext.form.Checkbox({fieldLabel: '尾部', checked: cell.getAttribute('footer') == 'Y'});
		var wAutoSize = this.wAutoSize = new Ext.form.Checkbox({fieldLabel: '自动调整列大小', checked: cell.getAttribute('autosizecolums') == 'Y'});
		var wForceFormulaRecalculation = this.wForceFormulaRecalculation = new Ext.form.Checkbox({fieldLabel: '强制公式重新计算', checked: cell.getAttribute('forceFormulaRecalculation') == 'Y'});
		var wLeaveExistingStylesUnchanged = this.wLeaveExistingStylesUnchanged = new Ext.form.Checkbox({fieldLabel: '不改变现有单元格格式', checked: cell.getAttribute('leaveExistingStylesUnchanged') == 'Y'});
		
		return {
			xtype: 'KettleForm',
			title: '工作表',
			labelWidth: 170,
			bodyStyle: 'padding: 0px 5px',
			items: [{
				xtype: 'fieldset',
				title: 'Sheet设置',
				items: [wSheetname, wMakeActiveSheet, wIfSheetExists, wProtectSheet, wProtectedBy, wPassword]
			},{
				xtype: 'fieldset',
				title: '内容选项',
				items: [wStartingCell, wRowWritingMethod, wHeader, wFooter, wAutoSize, wForceFormulaRecalculation, wLeaveExistingStylesUnchanged]
			}]
		};
	},
	
	getContentTab: function(cell) {
		var wAppendLines = this.wAppendLines = new Ext.form.Checkbox({fieldLabel: '在表的末尾行开始写（追加行）', checked: cell.getAttribute('appendLines') == 'Y'});
		var wSkipRows = this.wSkipRows = new Ext.form.TextField({fieldLabel: '抵消行数', anchor: '-10', value: cell.getAttribute('appendOffset')});
		var wEmptyRows = this.wEmptyRows = new Ext.form.TextField({fieldLabel: '在写入文件前添加的空行数', anchor: '-10', value: cell.getAttribute('appendEmpty')});
		var wOmitHeader = this.wOmitHeader = new Ext.form.Checkbox({fieldLabel: '删除表头', checked: cell.getAttribute('appendOmitHeader') == 'Y'});
		
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format','title','titleStyleCell','styleCell','commentField','commentAuthorField','formula','hyperlinkField'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var me = this;
		var wFields = this.wFields = new KettleEditorGrid({
			title: '字段',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', scope: this, handler: function() {
						me.onSure();
						
						getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(st) {
							// store.loadData(st.toJson({}));
							store.merge(st, ['name', 'type', 'format', {name: 'title', field: 'name'},'titleStyleCell','styleCell','commentField','commentAuthorField','formula','hyperlinkField']);
						});
					}
				});
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: '名称', dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: '类型', dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
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
				header: '格式', dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
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
				header: '单元格样式', dataIndex: 'styleCell', width: 100, editor: new Ext.form.TextField()
			},{
				header: '字段标题', dataIndex: 'title', width: 100, editor: new Ext.form.TextField()
			},{
				header: '单元格表头样式', dataIndex: 'titleStyleCell', width: 100, editor: new Ext.form.TextField()
			},{
				header: '字段包含公式', dataIndex: 'formula', width: 100, renderer: function(v)
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
				header: '超链接', dataIndex: 'hyperlinkField', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: 'Cell Comment Field(XLSX)', dataIndex: 'commentField', width: 100, editor: new Ext.form.ComboBox({
					displayField: 'name',
					valueField: 'name',
					typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true,
					store: getActiveGraph().inputFields(cell.getAttribute('label'))
				})
			},{
				header: 'Cell Comment Author Field(XLSX)', dataIndex: 'commentAuthorField', width: 100, editor: new Ext.form.ComboBox({
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
		});
		
		return {
			title: '内容',
			border: false,
			layout: 'border',
			items: [{
				xtype: 'KettleForm',
				labelWidth: 200,
				region: 'north',
				border: false,
				bodyStyle: 'padding: 5px',
				height: 150,
				items: [{
					xtype: 'fieldset',
					title: '写入已存在的工作表',
					items: [wAppendLines, wSkipRows, wEmptyRows, wOmitHeader]
				}]
			}, {
				border: false,
				layout: 'fit',
				region: 'center',
				bodyStyle: 'padding: 5px',
				items: wFields
			}]
		};
	}
});

Ext.reg('TypeExitExcelWriterStep', ExcelWriterStepDialog);