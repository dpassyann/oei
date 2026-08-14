# .mvn

This directory only exists to anchor Maven's `${maven.multiModuleProjectDirectory}`
property to this reactor's root, regardless of which module directory `mvn` is invoked
from — used by `checkstyle.xml`'s `configLocation` (see root `pom.xml`).
