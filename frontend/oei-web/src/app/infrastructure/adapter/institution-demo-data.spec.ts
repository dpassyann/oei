import { DEMO_INSTITUTION } from './institution-demo-data';

describe('institution-demo-data', () => {
  it('givenDemoInstitution_whenReadingLogoUrl_thenPointsToAnExistingPublicAsset', () => {
    // Régression : `logoUrl` pointait vers `/img/institutions/demo-institution-logo.svg`, un
    // chemin qui n'existait dans aucun dossier `public/` — le logo ne s'affichait jamais. Les
    // assets statiques de ce repo vivent sous `/assets/**` (voir `angular.json`, glob `public/**/*`,
    // et la convention déjà suivie par `partner-mock.adapter.ts`).
    expect(DEMO_INSTITUTION.logoUrl.startsWith('/assets/')).toBe(true);
  });
});
