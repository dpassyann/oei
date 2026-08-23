package global.oei.acceptance;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;

/**
 * JUnit 5 Platform Suite entry point for the whole Cucumber acceptance suite — this is the
 * class {@code mvn test}/{@code verify} actually runs; it discovers every {@code .feature}
 * file under {@code src/test/resources/features} and matches steps against
 * {@link AcceptanceSteps} (see that class's Javadoc for why every step lives there).
 */
@Suite
@IncludeEngines("cucumber")
@SelectPackages("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "global.oei.acceptance")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty")
public class RunCucumberTest {
}
