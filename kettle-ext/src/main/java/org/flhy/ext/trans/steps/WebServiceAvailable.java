package org.flhy.ext.trans.steps;

import java.util.List;

import org.flhy.ext.core.PropsUI;
import org.flhy.ext.trans.step.AbstractStep;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.pentaho.di.trans.steps.webserviceavailable.WebServiceAvailableMeta;
import org.pentaho.metastore.api.IMetaStore;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

@Component("WebServiceAvailable")
@Scope("prototype")
public class WebServiceAvailable extends AbstractStep {

	@Override
	public void decode(StepMetaInterface stepMetaInterface, mxCell cell, List<DatabaseMeta> databases, IMetaStore metaStore) throws Exception {
		WebServiceAvailableMeta wsaMeta = (WebServiceAvailableMeta) stepMetaInterface;
		wsaMeta.setURLField(cell.getAttribute("urlField"));
		wsaMeta.setConnectTimeOut(cell.getAttribute("connectTimeOut"));
		wsaMeta.setReadTimeOut(cell.getAttribute("readTimeOut"));
		wsaMeta.setResultFieldName(cell.getAttribute("resultfieldname"));
	}

	@Override
	public Element encode(StepMetaInterface stepMetaInterface) throws Exception {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.TRANS_STEP_NAME);
		WebServiceAvailableMeta wsaMeta = (WebServiceAvailableMeta) stepMetaInterface;
		
		e.setAttribute("urlField", wsaMeta.getURLField());
		e.setAttribute("connectTimeOut", wsaMeta.getConnectTimeOut());
		e.setAttribute("readTimeOut", wsaMeta.getReadTimeOut());
		e.setAttribute("resultfieldname", wsaMeta.getResultFieldName());
		
		return e;
	}

}
