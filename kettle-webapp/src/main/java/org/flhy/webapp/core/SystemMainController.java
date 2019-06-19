package org.flhy.webapp.core;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.core.row.ValueMetaAndDataCodec;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.JsonUtils;
import org.flhy.ext.utils.SvgImageUrl;
import org.flhy.webapp.bean.Ext3Node;
import org.pentaho.di.core.Condition;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.compress.CompressionProviderFactory;
import org.pentaho.di.core.logging.LogLevel;
import org.pentaho.di.core.plugins.JobEntryPluginType;
import org.pentaho.di.core.plugins.PartitionerPluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaAndData;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.row.value.ValueMetaPluginType;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.i18n.GlobalMessages;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.entries.checkdbconnection.JobEntryCheckDbConnections;
import org.pentaho.di.job.entries.delay.JobEntryDelay;
import org.pentaho.di.job.entries.deletefolders.JobEntryDeleteFolders;
import org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent;
import org.pentaho.di.job.entries.ftpsget.FTPSConnection;
import org.pentaho.di.job.entries.sftp.SFTPClient;
import org.pentaho.di.job.entries.simpleeval.JobEntrySimpleEval;
import org.pentaho.di.job.entry.JobEntryCopy;
import org.pentaho.di.laf.BasePropertyHandler;
import org.pentaho.di.trans.step.StepPartitioningMeta;
import org.pentaho.di.trans.steps.excelinput.SpreadSheetType;
import org.pentaho.di.trans.steps.exceloutput.ExcelOutputMeta;
import org.pentaho.di.trans.steps.excelwriter.ExcelWriterStepMeta;
import org.pentaho.di.trans.steps.multimerge.MultiMergeJoinMeta;
import org.pentaho.di.trans.steps.randomvalue.RandomValueMeta;
import org.pentaho.di.trans.steps.randomvalue.RandomValueMetaFunction;
import org.pentaho.di.trans.steps.setvariable.SetVariableMeta;
import org.pentaho.di.trans.steps.systemdata.SystemDataTypes;
import org.pentaho.di.trans.steps.textfileoutput.TextFileOutputMeta;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedCaseInsensitiveMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/system")
public class SystemMainController {
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/steps")
	protected void steps() throws ServletException, IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
		final List<PluginInterface> baseSteps = registry.getPlugins(StepPluginType.class);
		final List<String> baseCategories = registry.getCategories(StepPluginType.class);

		int i=0;
		for (String baseCategory : baseCategories) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", "category" + i++);
			jsonObject.put("text", baseCategory);
			jsonObject.put("icon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "Folder_image" )));
			jsonObject.put("cls", "core-folder");
			JSONArray children = new JSONArray();

			List<PluginInterface> sortedCat = new ArrayList<PluginInterface>();
			for (PluginInterface baseStep : baseSteps) {
				if (baseStep.getCategory().equalsIgnoreCase(baseCategory)) {
					sortedCat.add(baseStep);
				}
			}
			Collections.sort(sortedCat, new Comparator<PluginInterface>() {
				public int compare(PluginInterface p1, PluginInterface p2) {
					return p1.getName().compareTo(p2.getName());
				}
			});
			for (PluginInterface p : sortedCat) {
				String pluginName = p.getName();
				String pluginDescription = p.getDescription();
				
				if(PluginFactory.containBean(p.getIds()[0])) {
					JSONObject child = new JSONObject();
					child.put("id", "step" + i++);
					child.put("text", PluginFactory.containBean(p.getIds()[0]) ? pluginName : "<font color='red'>" + pluginName + "</font>");
					child.put("pluginId", p.getIds()[0]);
					child.put("icon", SvgImageUrl.getUrl(p));
					child.put("dragIcon", SvgImageUrl.getUrl(p));
					child.put("cls", "core-leaf");
					child.put("qtip", pluginDescription);
					child.put("leaf", true);
					children.add(child);
				}
				// if ( !filterMatch( pluginName ) && !filterMatch(
				// 	pluginDescription ) ) {
				// continue;
				// }
			}
			jsonObject.put("children", children);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/jobentrys")
	protected void jobentrys() throws ServletException, IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry registry = PluginRegistry.getInstance();
		final List<PluginInterface> baseJobEntries = registry.getPlugins(JobEntryPluginType.class);
		final List<String> baseCategories = registry.getCategories(JobEntryPluginType.class);

		int i=0;
		for (String baseCategory : baseCategories) {
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", "category" + i++);
			jsonObject.put("text", baseCategory);
			jsonObject.put("icon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "Folder_image" )));
			jsonObject.put("cls", "core-folder");
			JSONArray children = new JSONArray();

			List<PluginInterface> sortedCat = new ArrayList<PluginInterface>();
			if ( baseCategory.equalsIgnoreCase( JobEntryPluginType.GENERAL_CATEGORY ) ) {
				JobEntryCopy startEntry = JobMeta.createStartEntry();
				JSONObject child = new JSONObject();
				child.put("id", startEntry.getEntry().getPluginId());
				child.put("text", startEntry.getName());
				child.put("pluginId", startEntry.getEntry().getPluginId());
				child.put("icon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "STR_image" )));
				child.put("dragIcon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "STR_image" )));
				child.put("cls", "core-leaf");
				child.put("qtip", startEntry.getDescription());
				child.put("leaf", true);
				children.add(child);
				
				JobEntryCopy dummyEntry = JobMeta.createDummyEntry();
				child = new JSONObject();
				child.put("id", "step" + i++);
				child.put("text", dummyEntry.getName());
				child.put("pluginId", dummyEntry.getEntry().getPluginId());
				child.put("icon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "DUM_image" )));
				child.put("dragIcon", SvgImageUrl.getUrl(BasePropertyHandler.getProperty( "DUM_image" )));
				child.put("cls", "core-leaf");
				child.put("qtip", dummyEntry.getDescription());
				child.put("leaf", true);
				children.add(child);
		    }
			for (PluginInterface baseJobEntry : baseJobEntries) {
				if ( baseJobEntry.getIds()[ 0 ].equals( JobMeta.STRING_SPECIAL ) ) 
					continue;
				
				if (baseJobEntry.getCategory().equalsIgnoreCase(baseCategory)) {
					sortedCat.add(baseJobEntry);
				}
			}
			Collections.sort(sortedCat, new Comparator<PluginInterface>() {
				public int compare(PluginInterface p1, PluginInterface p2) {
					return p1.getName().compareTo(p2.getName());
				}
			});
			for (PluginInterface p : sortedCat) {
				String pluginName = p.getName();
				String pluginDescription = p.getDescription();
				
				if(PluginFactory.containBean(p.getIds()[0])) {
					JSONObject child = new JSONObject();
					child.put("id", "step" + i++);
					child.put("text", PluginFactory.containBean(p.getIds()[0]) ? pluginName : "<font color='red'>" + pluginName + "</font>");
					child.put("pluginId", p.getIds()[0]);
					child.put("icon", SvgImageUrl.getUrl(p));
					child.put("dragIcon", SvgImageUrl.getUrl(p));
					child.put("cls", "core-leaf");
					child.put("qtip", pluginDescription);
					child.put("leaf", true);
					children.add(child);
				}
				// if ( !filterMatch( pluginName ) && !filterMatch(
				// 	pluginDescription ) ) {
				// continue;
				// }
			}
			jsonObject.put("children", children);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/systemDataTypes")
	protected void systemDataTypes() throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		SystemDataTypes[] values = SystemDataTypes.values();
		for (SystemDataTypes value : values) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", value.getCode());
			jsonObject.put("descrp", value.getDescription());
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/randomValueFunc")
	protected void randomValueFunc() throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		RandomValueMetaFunction[] values = RandomValueMeta.functions;
		for (RandomValueMetaFunction value : values) {
			if(value == null) continue;
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("type", value.getType());
			jsonObject.put("code", value.getCode());
			jsonObject.put("descrp", value.getDescription());
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueMeta")
	protected void valueMeta() throws IOException {
		JSONArray jsonArray = new JSONArray();
		
		PluginRegistry pluginRegistry = PluginRegistry.getInstance();
		List<PluginInterface> plugins = pluginRegistry.getPlugins(ValueMetaPluginType.class);
		for (PluginInterface plugin : plugins) {
			int id = Integer.valueOf(plugin.getIds()[0]);
			if (id > 0 && id != ValueMetaInterface.TYPE_SERIALIZABLE) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("id", id);
				jsonObject.put("name", plugin.getName());
				jsonArray.add(jsonObject);
			}
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueFormat")
	protected void valueFormat(@RequestParam String valueType) throws IOException {
		JSONArray jsonArray = new JSONArray();
		if("all".equalsIgnoreCase(valueType)) {
			for(String format : Const.getConversionFormats()) {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("name", format);
				jsonArray.add(jsonObject);
			}
		} else {
			int type = ValueMeta.getType(valueType);
			if(type == ValueMetaInterface.TYPE_INTEGER || type == ValueMetaInterface.TYPE_NUMBER) {
				String[] fmt = Const.getNumberFormats();
				for (String str : fmt) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("id", ValueMeta.getType(str));
					jsonObject.put("name", str);
					jsonArray.add(jsonObject);
				}
			} else if(type == ValueMetaInterface.TYPE_DATE || type == ValueMetaInterface.TYPE_TIMESTAMP) {
				String[] fmt = Const.getDateFormats();
				for (String str : fmt) {
					JSONObject jsonObject = new JSONObject();
					jsonObject.put("id", ValueMeta.getType(str));
					jsonObject.put("name", str);
					jsonArray.add(jsonObject);
				}
			}
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/valueString")
	protected void valueString(HttpServletRequest request, HttpServletResponse response, @RequestParam String valueMeta) throws Exception {
		JSONObject jsonObject = JSONObject.fromObject(valueMeta);
		
		ValueMetaAndData valueMetaAndData = ValueMetaAndDataCodec.decode(jsonObject);
		String value = valueMetaAndData.toString();
		
		response.setContentType("text/html; charset=utf-8");
		response.getWriter().write(value);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/func")
	protected void func() throws Exception {
		
		JSONArray jsonArray = new JSONArray();
		for(int i=0; i<Condition.functions.length; i++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", Condition.functions[i]);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/datetimeformat")
	protected void datetimeformat() throws Exception {
		JSONArray jsonArray = new JSONArray();
		String[] dats = Const.getDateFormats();
	    for ( int x = 0; x < dats.length; x++ ) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", dats[x]);
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/formatMapperLineTerminator")
	protected void formatMapperLineTerminator() throws Exception {
		JSONArray jsonArray = new JSONArray();
		String[] dats = TextFileOutputMeta.formatMapperLineTerminator;
	    for ( int x = 0; x < dats.length; x++ ) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", dats[x]);
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/compressionProviderNames")
	protected void compressionProviderNames() throws Exception {
		JSONArray jsonArray = new JSONArray();
		String[] dats = CompressionProviderFactory.getInstance().getCompressionProviderNames();
	    for ( int x = 0; x < dats.length; x++ ) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", dats[x]);
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/availableCharsets")
	protected void availableCharsets() throws Exception {
		JSONArray jsonArray = new JSONArray();
		Collection<Charset> dats = Charset.availableCharsets().values();
	    for (Charset charset : dats) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", charset.displayName());
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/locale")
	protected void locale() throws Exception {
		JSONArray jsonArray = new JSONArray();
	    for (int i=0; i<GlobalMessages.localeCodes.length; i++) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", GlobalMessages.localeCodes[i]);
			jsonObject.put("desc", GlobalMessages.localeDescr[i]);
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/connectiontype")
	protected void connectiontype() throws Exception {
		JSONArray jsonArray = new JSONArray();
		String [] connection_type_Descs = FTPSConnection.connection_type_Desc;
	    for (String charset : connection_type_Descs) {
	      JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", charset );
			jsonArray.add(jsonObject);
	    }
		JsonUtils.response(jsonArray);
	}
	
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/proxyType")
	protected void proxyType() throws Exception {
		JSONArray jsonArray = new JSONArray();
		for (String str : new String[] { SFTPClient.PROXY_TYPE_HTTP, SFTPClient.PROXY_TYPE_SOCKS5 }) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", str);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/multijointype")
	protected void multijointype() throws Exception {
		JSONArray jsonArray = new JSONArray();
		for (String str : MultiMergeJoinMeta.join_types) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", str);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/timeunit")
	protected void timeunit() throws Exception {
		JSONArray jsonArray = new JSONArray();
		for (int i=0; i<JobEntryCheckDbConnections.unitTimeCode.length; i++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", JobEntryCheckDbConnections.unitTimeCode[i]);
			jsonObject.put("desc", JobEntryCheckDbConnections.unitTimeDesc[i]);
			jsonArray.add(jsonObject);
		}
		
		JsonUtils.response(jsonArray);
	}
	
	
	@RequestMapping(method=RequestMethod.POST, value="/timeunit2")
	protected @ResponseBody List timeunit2() throws Exception {
		ArrayList list = new ArrayList();
		
		LinkedCaseInsensitiveMap record = new LinkedCaseInsensitiveMap();
		record.put("code", "0");
		record.put("desc", BaseMessages.getString( JobEntryDelay.class, "JobEntryDelay.SScaleTime.Label" ));
		list.add(record);
		
		record = new LinkedCaseInsensitiveMap();
		record.put("code", "1");
		record.put("desc", BaseMessages.getString( JobEntryDelay.class, "JobEntryDelay.MnScaleTime.Label" ));
		list.add(record);
		
		record = new LinkedCaseInsensitiveMap();
		record.put("code", "2");
		record.put("desc", BaseMessages.getString( JobEntryDelay.class, "JobEntryDelay.HrScaleTime.Label" ));
		list.add(record);
		
		return list;
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/successCondition")
	protected void successCondition() throws Exception {
		JSONArray jsonArray = new JSONArray();
		String [] successConditionsCode = JobEntryEvalTableContent.successConditionsCode;
		for (int i=0; i<successConditionsCode.length; i++) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", successConditionsCode[i]);
			jsonObject.put("text", JobEntryEvalTableContent.getSuccessConditionDesc(i));
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/logLevel")
	protected void logLevel() throws Exception {
		JSONArray jsonArray = new JSONArray();
	    for (LogLevel level : new LogLevel[]{LogLevel.NOTHING, LogLevel.ERROR, LogLevel.MINIMAL, 
	    		LogLevel.BASIC, LogLevel.DETAILED, LogLevel.DEBUG, LogLevel.ROWLEVEL}) {
	    	
	    	JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", level.getLevel());
			jsonObject.put("code", level.getCode());
			jsonObject.put("desc", level.getDescription());
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/variableType")
	protected void variableType() throws Exception {
		JSONArray jsonArray = new JSONArray();
	    for (int i=0; i<SetVariableMeta.getVariableTypeDescriptions().length; i++) {
	    	
	    	JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", i);
			jsonObject.put("code", SetVariableMeta.getVariableTypeCode(i));
			jsonObject.put("desc", SetVariableMeta.getVariableTypeDescription(i));
			jsonArray.add(jsonObject);
	    }
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/partitionMethod")
	protected void partitionMethod() throws Exception {
		JSONArray jsonArray = new JSONArray();
	    for (int i=0; i<StepPartitioningMeta.methodCodes.length; i++) {
	    	
	    	JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", StepPartitioningMeta.methodCodes[i]);
			jsonObject.put("desc", StepPartitioningMeta.methodDescriptions[i]);
			jsonArray.add(jsonObject);
	    }
	    
	    PluginRegistry registry = PluginRegistry.getInstance();
        List<PluginInterface> plugins = registry.getPlugins( PartitionerPluginType.class );
        for ( PluginInterface plugin : plugins ) {
          	JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", plugin.getIds()[ 0 ]);
			jsonObject.put("desc", plugin.getDescription());
			jsonArray.add(jsonObject);
        }
		
		JsonUtils.response(jsonArray);
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/filextension")
	protected @ResponseBody List filextension(@RequestParam int extension) throws Exception {
		return FileNodeType.toList(extension);
	}
	
	
	@RequestMapping(method=RequestMethod.POST, value="/fileexplorer")
	protected @ResponseBody List fileexplorer(@RequestParam String path, @RequestParam int extension) throws Exception {
		LinkedList directorys = new LinkedList();
		LinkedList leafs = new LinkedList();
		if(StringUtils.hasText(path)) {
			File[] files = new File(path).listFiles();
			if(files != null) {
				for(File file : files) {
					if(file.isHidden())
						continue;
					if(file.isDirectory()) {
						directorys.addLast(Ext3Node.initNode(file.getAbsolutePath(), file.getName()));
					} else if(file.isFile() && FileNodeType.match(FileNodeType.getExtension(file.getName()), extension)){
						leafs.addLast(Ext3Node.initNode(file.getAbsolutePath(), file.getName(), true));
					}
				}
			}
		} else {
			File[] files = File.listRoots();
			for(File file : files) {
				if(file.isDirectory()) {
					directorys.addLast(Ext3Node.initNode(file.getAbsolutePath(), file.getCanonicalPath()));
				} else if(file.isFile() && FileNodeType.match(FileNodeType.getExtension(file.getName()), extension)){
					leafs.addLast(Ext3Node.initNode(file.getAbsolutePath(), file.getCanonicalPath(), true));
				}
			}
		}
		
		directorys.addAll(leafs);
		return directorys;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/deleteFoldersSuccessCondition")
	protected @ResponseBody List deleteFoldersSuccessCondition() throws Exception{
		ArrayList list = new ArrayList();
		
		LinkedCaseInsensitiveMap record = new LinkedCaseInsensitiveMap();
		record.put("code", "success_when_at_least");
		record.put("desc", BaseMessages.getString( JobEntryDeleteFolders.class, "JobDeleteFolders.SuccessWhenAtLeat.Label" ));
		list.add(record);
		
		record = new LinkedCaseInsensitiveMap();
		record.put("code", "success_if_errors_less");
		record.put("desc", BaseMessages.getString( JobEntryDeleteFolders.class, "JobDeleteFolders.SuccessWhenErrorsLessThan.Label" ));
		list.add(record);
		
		record = new LinkedCaseInsensitiveMap();
		record.put("code", "success_if_no_errors");
		record.put("desc", BaseMessages.getString( JobEntryDeleteFolders.class, "JobDeleteFolders.SuccessWhenAllWorksFine.Label" ));
		list.add(record);
		
		return list;
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/successConditionForSimp")
	protected void successConditionForSimp() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<JobEntrySimpleEval.successConditionCode.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", JobEntrySimpleEval.successConditionCode[i]);
			jsonObject.put("text", JobEntrySimpleEval.successConditionDesc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/successNumberCondition")
	protected void successNumberCondition() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<JobEntrySimpleEval.successNumberConditionCode.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", JobEntrySimpleEval.successNumberConditionCode[i]);
			jsonObject.put("text", JobEntrySimpleEval.successNumberConditionDesc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/excelSheetType")
	protected void excelSheetType() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<SpreadSheetType.values().length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("code", SpreadSheetType.values()[i].toString());
			jsonObject.put("desc", SpreadSheetType.values()[i].getDescription());
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/fontname")
	protected void fontname() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<ExcelOutputMeta.font_name_desc.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", i);
			jsonObject.put("text", ExcelOutputMeta.font_name_desc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/fontoriention")
	protected void fontoriention() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<ExcelOutputMeta.font_orientation_desc.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", i);
			jsonObject.put("text", ExcelOutputMeta.font_orientation_desc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/fontalignment")
	protected void fontalignment() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<ExcelOutputMeta.font_alignment_desc.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", i);
			jsonObject.put("text", ExcelOutputMeta.font_alignment_desc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/fontcolor")
	protected void fontcolor() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<ExcelOutputMeta.font_color_desc.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", i);
			jsonObject.put("text", ExcelOutputMeta.font_color_desc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/fontunderline")
	protected void fontunderline() throws Exception{
		JSONArray jsonArray = new JSONArray();
		for(int i=0;i<ExcelOutputMeta.font_underline_desc.length;i++){
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("value", i);
			jsonObject.put("text", ExcelOutputMeta.font_underline_desc[i]);
			jsonArray.add(jsonObject);
		}
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/excelwritemethod")
	protected void excelwritemethod() throws Exception{
		JSONArray jsonArray = new JSONArray();
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("value", ExcelWriterStepMeta.IF_FILE_EXISTS_CREATE_NEW);
		jsonObject.put("text", "覆盖原工作表");
		jsonArray.add(jsonObject);
		
		jsonObject = new JSONObject();
		jsonObject.put("value", ExcelWriterStepMeta.IF_FILE_EXISTS_REUSE);
		jsonObject.put("text", "输出至已存在的工作表中");
		jsonArray.add(jsonObject);
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/excelrowwritemethod")
	protected void excelrowwritemethod() throws Exception{
		JSONArray jsonArray = new JSONArray();
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("value", ExcelWriterStepMeta.ROW_WRITE_OVERWRITE);
		jsonObject.put("text", "覆盖已存在的单元格");
		jsonArray.add(jsonObject);
		
		jsonObject = new JSONObject();
		jsonObject.put("value", ExcelWriterStepMeta.ROW_WRITE_PUSH_DOWN);
		jsonObject.put("text", "下移已有单元格");
		jsonArray.add(jsonObject);
		
		JsonUtils.response(jsonArray);
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/excelType")
	protected void excelType() throws Exception{
		JSONArray jsonArray = new JSONArray();
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("value", "xls");
		jsonObject.put("text", "xls [Excel 97 and above]");
		jsonArray.add(jsonObject);
		
		jsonObject = new JSONObject();
		jsonObject.put("value", "xlsx");
		jsonObject.put("text", "xlsx [Excel 2007 and above]");
		jsonArray.add(jsonObject);
		
		JsonUtils.response(jsonArray);
	}
}
