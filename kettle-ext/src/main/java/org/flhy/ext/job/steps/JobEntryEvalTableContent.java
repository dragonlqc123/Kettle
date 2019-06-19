package org.flhy.ext.job.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.job.step.AbstractJobEntry;
import org.flhy.ext.utils.StringEscapeHelper;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("EVAL_TABLE_CONTENT")
@Scope("prototype")
public class JobEntryEvalTableContent extends AbstractJobEntry {
	@Override
	public void decode(JobEntryInterface jobEntry, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent  jobEntryEvaluatetablecontent = (org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent) jobEntry;
		//一般---服务器设置
		jobEntryEvaluatetablecontent.customSQL=(StringEscapeHelper.decode(cell.getAttribute("customSQL")));
		String con = cell.getAttribute( "connection" );
		jobEntryEvaluatetablecontent.setDatabase(DatabaseMeta.findDatabase( databases, con ));
		jobEntryEvaluatetablecontent.schemaname=cell.getAttribute("schemaname");
		jobEntryEvaluatetablecontent.tablename=(cell.getAttribute("tablename"));
		jobEntryEvaluatetablecontent.successCondition= jobEntryEvaluatetablecontent.getSuccessConditionByDesc(cell.getAttribute( "successCondition" ));
		jobEntryEvaluatetablecontent.limit=Const.NVL(cell.getAttribute("limit"), "0");
		jobEntryEvaluatetablecontent.iscustomSQL=("Y".equalsIgnoreCase(cell.getAttribute("iscustomSQL")));
		jobEntryEvaluatetablecontent.isUseVars=("Y".equalsIgnoreCase(cell.getAttribute("isUseVars")));
		jobEntryEvaluatetablecontent.isClearResultList=("Y".equalsIgnoreCase(cell.getAttribute("isClearResultList")));
		jobEntryEvaluatetablecontent.isAddRowsResult=("Y".equalsIgnoreCase(cell.getAttribute("isAddRowsResult")));
	}

	@Override
	public Element encode(JobEntryInterface jobEntry) throws Exception    {
		org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent  jobEntryEvaluatetablecontent = (org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent) jobEntry;
		String[] successConditionsCode = org.pentaho.di.job.entries.evaluatetablecontent.JobEntryEvalTableContent.successConditionsCode;
		
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_JOBENTRY_NAME);
		//一般---服务器设置
		e.setAttribute("customSQL", StringEscapeHelper.encode(jobEntryEvaluatetablecontent.customSQL));
		e.setAttribute("connection",  jobEntryEvaluatetablecontent.getDatabase() == null ? "" : jobEntryEvaluatetablecontent.getDatabase().getName());
		e.setAttribute("schemaname", jobEntryEvaluatetablecontent.schemaname );
		e.setAttribute("tablename", jobEntryEvaluatetablecontent.tablename);
		e.setAttribute("successCondition", successConditionsCode[jobEntryEvaluatetablecontent.getSuccessCobdition()]);
		e.setAttribute("limit", jobEntryEvaluatetablecontent.limit );
		e.setAttribute("iscustomSQL", jobEntryEvaluatetablecontent.iscustomSQL ? "Y" : "N");
		e.setAttribute("isUseVars", jobEntryEvaluatetablecontent.isUseVars ? "Y" : "N");
		e.setAttribute("isClearResultList", jobEntryEvaluatetablecontent.isClearResultList ? "Y" : "N");
		e.setAttribute("isAddRowsResult", jobEntryEvaluatetablecontent.isAddRowsResult ? "Y" : "N");

		return e;
	}

	

}
