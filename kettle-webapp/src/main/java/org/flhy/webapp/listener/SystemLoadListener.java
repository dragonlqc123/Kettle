package org.flhy.webapp.listener;

import java.io.File;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.flhy.ext.App;
import org.flhy.ext.core.PropsUI;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.exception.KettleException;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.repository.filerep.KettleFileRepository;
import org.pentaho.di.repository.filerep.KettleFileRepositoryMeta;

public class SystemLoadListener implements ServletContextListener {

	@Override
	public void contextDestroyed(ServletContextEvent context) {
		
	}

	@Override
	public void contextInitialized(ServletContextEvent context) {
//		System.setProperty(Const.KETTLE_CORE_STEPS_FILE, "org/flhy/ext/kettle-steps-file.xml");
		try {
			// 日志缓冲不超过5000行，缓冲时间不超过720秒
			KettleLogStore.init( 5000, 720 );
			KettleEnvironment.init();
//			Props.init( Props.TYPE_PROPERTIES_KITCHEN );
			PropsUI.init( "KettleWebConsole", Props.TYPE_PROPERTIES_KITCHEN );
			
//			String path = context.getServletContext().getRealPath("/reposity/");
			File path = new File("samples/repository");
			KettleFileRepositoryMeta meta = new KettleFileRepositoryMeta();
			meta.setBaseDirectory(path.getAbsolutePath());
			meta.setDescription("default");
			meta.setName("default");
			meta.setReadOnly(false);
			meta.setHidingHiddenFiles(true);
			
			KettleFileRepository rep = new KettleFileRepository();
			rep.init(meta);
			
			App.getInstance().initDefault(rep);
		} catch (KettleException e) {
			e.printStackTrace();
		}
	}

}
