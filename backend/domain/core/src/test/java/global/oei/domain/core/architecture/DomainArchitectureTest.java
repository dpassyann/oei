package global.oei.domain.core.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Guards the "domain stays framework-agnostic" rule from the architecture skill:
 * neither {@code domain-core} nor its {@code domain-shared} dependency may reference
 * Spring or JPA types. Maven Enforcer dependency-graph rules are tracked as a TODO
 * (see backend/pom.xml); this test is the enforcement mechanism in the meantime.
 */
@AnalyzeClasses(packages = {"global.oei.domain.core", "global.oei.domain.shared"}, importOptions = ImportOption.DoNotIncludeTests.class)
class DomainArchitectureTest {

    @ArchTest
    static final ArchRule domain_must_not_depend_on_spring =
            noClasses().that().resideInAPackage("global.oei.domain..")
                    .should().dependOnClassesThat().resideInAPackage("org.springframework..");

    @ArchTest
    static final ArchRule domain_must_not_depend_on_jakarta_persistence =
            noClasses().that().resideInAPackage("global.oei.domain..")
                    .should().dependOnClassesThat().resideInAPackage("jakarta.persistence..");
}
