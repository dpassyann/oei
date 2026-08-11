package global.oei.test.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Reactor-wide architecture rules, analyzed across every module on this module's test
 * classpath (domain-shared, domain-core, infrastructure-*, application-web). Complements
 * {@code DomainArchitectureTest} in {@code domain/core}, which only sees domain-shared +
 * domain-core and cannot express inter-module rules such as "application-web must not
 * depend on domain-core".
 */
@AnalyzeClasses(packages = "global.oei", importOptions = ImportOption.DoNotIncludeTests.class)
class CrossModuleArchitectureTest {

    @ArchTest
    static final ArchRule domain_must_not_depend_on_spring =
            noClasses().that().resideInAPackage("global.oei.domain..")
                    .should().dependOnClassesThat().resideInAPackage("org.springframework..");

    @ArchTest
    static final ArchRule domain_must_not_depend_on_jakarta_persistence =
            noClasses().that().resideInAPackage("global.oei.domain..")
                    .should().dependOnClassesThat().resideInAPackage("jakarta.persistence..");

    /**
     * application-web must stay 100% interface-first with respect to the domain: the sole
     * class allowed to import concrete domain-core types is
     * {@code OeiWiringConfiguration} (infrastructure-wiring).
     */
    @ArchTest
    static final ArchRule application_web_must_not_depend_on_domain_core =
            noClasses().that().resideInAPackage("global.oei.application.web..")
                    .should().dependOnClassesThat().resideInAPackage("global.oei.domain.core..");

    /**
     * Naming convention: REST controllers are suffixed {@code Resource}, never
     * {@code Controller}.
     */
    @ArchTest
    static final ArchRule rest_controllers_must_be_named_resource =
            classes().that().areAnnotatedWith(RestController.class)
                    .should().haveSimpleNameEndingWith("Resource");

    /**
     * {@code *Impl}/{@code impl} is banned project-wide: concrete implementations of a
     * {@code *Adapter} interface belong in a sibling {@code service} package instead (see
     * {@code MembershipService implements MembershipAdapter}).
     */
    @ArchTest
    static final ArchRule no_impl_suffix_or_package =
            noClasses().should().haveSimpleNameEndingWith("Impl")
                    .orShould().resideInAPackage("..impl..");

    /**
     * Convention scoped to primary-adapter modules (e.g. {@code application-web}'s
     * {@code adapter} package): a {@code *Adapter}-suffixed type declared there is always
     * an interface — the concrete implementation lives in a sibling {@code service}
     * package (e.g. {@code MembershipAdapter} interface / {@code MembershipService} impl).
     * This does NOT apply to secondary/infrastructure adapters (e.g.
     * {@code MembershipPersistenceAdapter}), which are legitimately concrete classes
     * implementing an outbound port in the hexagonal sense.
     */
    @ArchTest
    static final ArchRule primary_adapter_package_types_must_be_interfaces =
            classes().that().resideInAPackage("global.oei..application.web.adapter..")
                    .should().beInterfaces();
}
