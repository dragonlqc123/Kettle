ExcelOutputDialog = Ext.extend(KettleTabDialog, {
	width: 700,
	height: 620,
	title: 'Excel输出',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		this.initData = function() {
			var cell = this.getInitData();
			ExcelOutputDialog.superclass.initData.apply(this, [cell]);
			
			this.wProtectSheet.setValue('Y' == cell.getAttribute('protect_sheet'));
			this.wuseTempFiles.setValue('Y' == cell.getAttribute('usetempfiles'));
			this.wTemplate.setValue('Y' == cell.getAttribute('template_enabled'));
			
		};
		
		this.saveData = function(){
			var data = {};
			
			// file tab
			data.file_name = this.wFilename.getValue();
			data.create_parent_folder = this.wCreateParentFolder.getValue() ? "Y" : "N";
			data.do_not_open_new_file_init = this.wDoNotOpenNewFileInit.getValue() ? "Y" : "N";
			data.file_extention = this.wExtension.getValue();
			data.file_add_stepnr = this.wAddStepnr.getValue() ? "Y" : "N";
			data.file_add_date = this.wAddDate.getValue() ? "Y" : "N";
			data.file_add_time = this.wAddTime.getValue() ? "Y" : "N";
			data.SpecifyFormat = this.wSpecifyFormat.getValue() ? "Y" : "N";
			data.date_time_format = this.wDateTimeFormat.getValue();
			data.add_to_result_filenames = this.wAddToResult.getValue() ? "Y" : "N";
			
			//content tab
			data.append = this.wAppend.getValue() ? "Y" : "N";
			data.header = this.wHeader.getValue() ? "Y" : "N";
			data.footer = this.wFooter.getValue() ? "Y" : "N";
			data.encoding = this.wEncoding.getValue();
			data.file_split = this.wSplitEvery.getValue();
			data.sheetname = this.wSheetname.getValue();
			data.protect_sheet = this.wProtectSheet.getValue() ? "Y" : "N";
			data.password = this.wPassword.getValue();
			
			data.autosizecolums = this.wAutoSize.getValue();
			data.nullisblank = this.wNullIsBlank.getValue();
			data.usetempfiles = this.wuseTempFiles.getValue() ? "Y" : "N";
			data.tempdirectory = this.wTempDirectory.getValue();
			
			data.template_enabled = this.wTemplate.getValue();
			data.template_filename = this.wTemplateFilename.getValue() ? "Y" : "N";
			data.template_append = this.wTemplateAppend.getValue();
			
			// format tab
			data.header_font_name = this.wHeaderFontName.getValue();
			data.header_font_size = this.wHeaderFontSize.getValue();
			data.header_font_bold = this.wHeaderFontBold.getValue() ? "Y" : "N";
			data.header_font_italic = this.wHeaderFontItalic.getValue() ? "Y" : "N";
			data.header_font_underline = this.wHeaderFontUnderline.getValue();
			data.header_font_orientation = this.wHeaderFontOrientation.getValue();
			data.header_font_color = this.wHeaderFontColor.getValue();
			data.header_background_color = this.wHeaderBackGroundColor.getValue();
			data.header_row_height = this.wHeaderRowHeight.getValue();
			data.header_alignment = this.wHeaderAlignment.getValue();
			data.header_image = this.wImage.getValue();
			
			data.row_font_name = this.wRowFontName.getValue();
			data.row_font_size = this.wRowFontSize.getValue();
			data.row_font_color = this.wRowFontColor.getValue();
			data.row_background_color = this.wRowBackGroundColor.getValue();
			
			// fields tab
			data.fields = Ext.encode(this.wFields.getStore().toJson());
			
			return data;
		}
		
		
		
		this.tabItems = [this.getFileTab(cell), this.getContentTab(cell), this.getFormatTab(cell), this.getFieldsTab(cell)];
		ExcelOutputDialog.superclass.initComponent.call(this);
	},
	
	getFileTab: function(cell) {
		var wFilename = this.wFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('file_name')});
		var wCreateParentFolder = this.wCreateParentFolder = new Ext.form.Checkbox({fieldLabel: '创建父目录', checked: cell.getAttribute('create_parent_folder') == 'Y'});
		var wDoNotOpenNewFileInit = this.wDoNotOpenNewFileInit = new Ext.form.Checkbox({fieldLabel: '启动时不创建文件', checked: cell.getAttribute('do_not_open_new_file_init') == 'Y'});
		var wExtension = this.wExtension = new Ext.form.TextField({fieldLabel: '扩展名', anchor: '-10', value: cell.getAttribute('file_extention')});
		var wAddStepnr = this.wAddStepnr = new Ext.form.Checkbox({fieldLabel: '文件名里包含步骤数', checked: cell.getAttribute('file_add_stepnr') == 'Y'});
		var wAddDate = this.wAddDate = new Ext.form.Checkbox({fieldLabel: '文件名里包含日期', checked: cell.getAttribute('file_add_date') == 'Y'});
		var wAddTime = this.wAddTime = new Ext.form.Checkbox({fieldLabel: '文件名里包含时间', checked: cell.getAttribute('file_add_time') == 'Y'});
		var wSpecifyFormat = this.wSpecifyFormat = new Ext.form.Checkbox({fieldLabel: '指定日期时间格式', checked: cell.getAttribute('SpecifyFormat') == 'Y'});
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
			value: cell.getAttribute('date_time_format')
		});
		var wAddToResult = this.wAddToResult = new Ext.form.Checkbox({fieldLabel: '结果中添加文件名', checked: cell.getAttribute('add_to_result_filenames') == 'Y'});
		
		return {
			xtype: 'KettleForm',
			title: '文件',
			bodyStyle: 'padding: 10px 0px',
			labelWidth: 170,
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
			}, wCreateParentFolder, wDoNotOpenNewFileInit, wExtension, wAddStepnr, wAddDate, wAddTime, 
			wSpecifyFormat, wDateTimeFormat, wAddToResult]
		};
	},
	
	getContentTab: function(cell) {
		var wAppend = this.wAppend = new Ext.form.Checkbox({fieldLabel: '追加', checked: cell.getAttribute('append') == 'Y'});
		var wHeader = this.wHeader = new Ext.form.Checkbox({fieldLabel: '头部', checked: cell.getAttribute('header') == 'Y'});
		var wFooter = this.wFooter = new Ext.form.Checkbox({fieldLabel: '尾部', checked: cell.getAttribute('footer') == 'Y'});
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
		var wSplitEvery = this.wSplitEvery = new Ext.form.TextField({fieldLabel: '分拆...每一行', anchor: '-10', value: cell.getAttribute('file_split')});
		var wSheetname = this.wSheetname = new Ext.form.TextField({fieldLabel: 'Sheet名称', anchor: '-10', value: cell.getAttribute('sheetname')});
		var wProtectSheet = this.wProtectSheet = new Ext.form.Checkbox({fieldLabel: '保护Sheet', checked: true});
		var wPassword = this.wPassword = new Ext.form.TextField({fieldLabel: '密码', anchor: '-10', value: cell.getAttribute('password')});
		
		wProtectSheet.on('check', function(cb, checked) {
			if(checked)
			{
				wPassword.setDisabled(false);

			}else{
				wPassword.setDisabled(true);
			}
		});
		
		var wAutoSize = this.wAutoSize = new Ext.form.Checkbox({fieldLabel: '自动调整列大小', checked: cell.getAttribute('autosizecolums') == 'Y'});
		var wNullIsBlank = this.wNullIsBlank = new Ext.form.Checkbox({fieldLabel: '保留NULL值', checked: cell.getAttribute('nullisblank') == 'Y'});
		var wuseTempFiles = this.wuseTempFiles = new Ext.form.Checkbox({fieldLabel: '使用临时文件', checked: true});
		var wTempDirectory = this.wTempDirectory = new Ext.form.TextField({flex: 1, value: cell.getAttribute('tempdirectory')});
		
		wuseTempFiles.on('check', function(cb, checked) {
			if(checked)
			{
				wTempDirectory.setDisabled(false);

			}else{
				wTempDirectory.setDisabled(true);
			}
		});
		
		var wTemplate = this.wTemplate = new Ext.form.Checkbox({fieldLabel: '使用模板', checked: true});
		var wTemplateFilename = this.wTemplateFilename = new Ext.form.TextField({flex: 1, value: cell.getAttribute('template_filename')});
		var wTemplateAppend = this.wTemplateAppend = new Ext.form.Checkbox({fieldLabel: '追加Excel模板', checked: cell.getAttribute('template_append') == 'Y'});
		
		wTemplate.on('check', function(cb, checked) {
			if(checked)
			{
				wTemplateFilename.setDisabled(false);
				wTemplateAppend.setDisabled(false);
			}else{
				wTemplateFilename.setDisabled(true);
				wTemplateAppend.setDisabled(true);
			}
		});
		
		return {
			xtype: 'KettleForm',
			title: '内容',
			bodyStyle: 'padding: 10px 5px',
			labelWidth: 170,
			items: [wAppend, wHeader, wFooter, wEncoding, wSplitEvery, wSheetname, wProtectSheet, 
				wPassword, wAutoSize, wNullIsBlank, wuseTempFiles, {
					xtype: 'compositefield',
					fieldLabel: '临时文件目录',
					anchor: '-10',
					items: [wTempDirectory, {
						xtype: 'button', text: '浏览..', handler: function() {
							var dialog = new FileExplorerWindow();
							dialog.on('ok', function(path) {
								wTempDirectory.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
			}, {
				xtype: 'fieldset',
				title: '模板',
				items: [wTemplate, {
					xtype: 'compositefield',
					fieldLabel: '临时文件目录',
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
				}, wTemplateAppend]
			}]
		};
	},
	
	getFormatTab: function() {
		var wHeaderFontName = this.wHeaderFontName = new Ext.form.ComboBox({
			fieldLabel: '表头字体',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontnameStore'),
			value: cell.getAttribute('header_font_name')
	    });
		
		var wHeaderFontSize = this.wHeaderFontSize = new Ext.form.TextField({fieldLabel: '表头字体大小', anchor: '-10', value: cell.getAttribute('header_font_size')});
		var wHeaderFontBold = this.wHeaderFontBold = new Ext.form.Checkbox({fieldLabel: '表头字体加粗', checked: cell.getAttribute('header_font_bold') == 'Y'});
		var wHeaderFontItalic = this.wHeaderFontItalic = new Ext.form.Checkbox({fieldLabel: '表头字体倾斜', checked: cell.getAttribute('header_font_italic') == 'Y'});
		
		var wHeaderFontUnderline = this.wHeaderFontUnderline = new Ext.form.ComboBox({
			fieldLabel: '表头字体下划线',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontunderlineStore'),
			value: cell.getAttribute('header_font_underline')
	    });
		
		var wHeaderFontOrientation = this.wHeaderFontOrientation = new Ext.form.ComboBox({
			fieldLabel: '表头字体方向',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontorientionStore'),
			value: cell.getAttribute('header_font_orientation')
	    });
		
		var wHeaderFontColor = this.wHeaderFontColor = new Ext.form.ComboBox({
			fieldLabel: '表头字体颜色',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontcolorStore'),
			value: cell.getAttribute('header_font_color')
	    });
		
		var wHeaderBackGroundColor = this.wHeaderBackGroundColor = new Ext.form.ComboBox({
			fieldLabel: '表头背景颜色',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontcolorStore'),
			value: cell.getAttribute('header_background_color')
	    });
		var wHeaderRowHeight = this.wHeaderRowHeight = new Ext.form.TextField({fieldLabel: '表头高度', anchor: '-10', value: cell.getAttribute('header_row_height')});
		var wHeaderAlignment = this.wHeaderAlignment = new Ext.form.ComboBox({
			fieldLabel: '表头对齐方式',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontalignmentStore'),
			value: cell.getAttribute('header_alignment')
	    });
		var wImage = this.wImage = new Ext.form.TextField({flex: 1, value: cell.getAttribute('header_image')});
		
		
		var wRowFontName = this.wRowFontName = new Ext.form.ComboBox({
			fieldLabel: '数据字体',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontnameStore'),
			value: cell.getAttribute('row_font_name')
	    });
		
		var wRowFontSize = this.wRowFontSize = new Ext.form.TextField({fieldLabel: '数据字体大小', anchor: '-10', value: cell.getAttribute('row_font_size')});
		
		var wRowFontColor = this.wRowFontColor = new Ext.form.ComboBox({
			fieldLabel: '数据字体颜色',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontcolorStore'),
			value: cell.getAttribute('row_font_color')
	    });
		
		var wRowBackGroundColor = this.wRowBackGroundColor = new Ext.form.ComboBox({
			fieldLabel: '数据背景颜色',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('fontcolorStore'),
			value: cell.getAttribute('row_background_color')
	    });
		
		return {
			xtype: 'KettleForm',
			title: '格式',
			bodyStyle: 'padding: 10px 5px',
			labelWidth: 170,
			items: [{
				xtype: 'fieldset',
				title: '表头字体',
				items: [wHeaderFontName, wHeaderFontSize, wHeaderFontBold, wHeaderFontItalic, wHeaderFontUnderline,
					wHeaderFontOrientation, wHeaderFontColor, wHeaderBackGroundColor, wHeaderRowHeight, wHeaderAlignment, {
					xtype: 'compositefield',
					fieldLabel: '添加图片',
					anchor: '-10',
					items: [wImage, {
						xtype: 'button', text: '浏览..', handler: function() {
							var dialog = new FileExplorerWindow({extension: 256});
							dialog.on('ok', function(path) {
								wImage.setValue(path);
								dialog.close();
							});
							dialog.show();
						}
					}]
				}]
			}, {
				xtype: 'fieldset',
				title: '表数据字体',
				items: [wRowFontName, wRowFontSize, wRowFontColor, wRowBackGroundColor]
			}]
		};
	},
	
	getFieldsTab: function(cell) {
		var store = new Ext.data.JsonStore({
			fields: ['name', 'type', 'format'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var wFields = this.wFields = new KettleEditorGrid({
			title: '字段',
			menuAdd: function(menu) {
				menu.insert(0, {
					text: '获取字段', scope: this, handler: function() {
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
			}],
			store: store
		});
		
		return wFields;
	}
});

Ext.reg('ExcelOutput', ExcelOutputDialog);