// Seed témoignages et articles blog pour Cabinet Berthier (données de démo, fictives)
// Les témoignages sont génériques (plausibles mais non sourcés)
// Les articles sont rédigés pour la démo, sur la base des compétences du cabinet
//
// Idempotent via upsert sur le slug (posts) et match exact (testimonials).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync("apps/web/.env.local", "utf8");
const env = Object.fromEntries(
  envText.split("\n").filter((l) => l.includes("=")).map((l) => l.split("=").map((s) => s.trim())),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const testimonials = [
  {
    name: "Isabelle D.",
    role: "Propriétaire vendeuse, Trocadéro",
    content: "J'ai confié la vente de l'appartement de famille à Julien Berthier après plusieurs rendez-vous peu concluants ailleurs. Son estimation était précise, documentée, et il a su filtrer les visiteurs pour ne présenter que des dossiers solides. La transaction a été signée en moins de trois mois, au prix que nous avions fixé ensemble.",
    rating: 5,
  },
  {
    name: "Jean-François L.",
    role: "Acquéreur, Avenue Foch",
    content: "Un interlocuteur rare dans le quartier : Camille Berthier connaît les immeubles, les copropriétés, et prend le temps d'expliquer ce qui distingue un bel haussmannien d'un pastiche. Je cherchais un pied-à-terre depuis plus d'un an, elle m'a trouvé exactement ce que je décrivais.",
    rating: 5,
  },
  {
    name: "Sophie M.",
    role: "Bailleresse",
    content: "Je leur ai confié la gestion locative de deux appartements rue de la Pompe. Reporting trimestriel clair, locataires sérieux, loyers versés à date. Rien à redire, ce qui, en gestion immobilière, est déjà beaucoup.",
    rating: 5,
  },
  {
    name: "Alexander R.",
    role: "Acquéreur expatrié (Londres)",
    content: "Working from abroad, I needed an agency I could trust to represent my interests honestly. Cabinet Berthier handled every step with professionalism, including remote document signing and due diligence on the building. Camille's English is perfect, which made the whole acquisition smooth.",
    rating: 5,
  },
  {
    name: "Béatrice H.",
    role: "Vendeuse d'un bien familial",
    content: "Après le décès de ma mère, nous étions trois enfants à devoir vendre un grand appartement près de la place Victor Hugo. Julien Berthier a été d'une délicatesse remarquable, patient avec nos désaccords, et très professionnel sur les aspects successoraux. Nous avons signé dans de bonnes conditions.",
    rating: 5,
  },
  {
    name: "Thomas P.",
    role: "Locataire longue durée",
    content: "Agence réactive et humaine, ce qui n'est pas toujours la norme dans le 16ᵉ. Les visites ont été organisées rapidement, le dossier accepté sous 48 heures, et les échanges avec le gestionnaire se font toujours dans de bonnes conditions. Je recommande.",
    rating: 4,
  },
  {
    name: "Catherine V.",
    role: "Propriétaire, Passy",
    content: "J'ai apprécié l'honnêteté de l'estimation, même quand elle allait à l'encontre de mes attentes initiales. On sent une vraie connaissance du quartier et de ses micro-marchés, rue par rue. L'appartement s'est vendu au prix annoncé, sans négociation interminable.",
    rating: 5,
  },
];

const posts = [
  {
    title: "Le marché immobilier du 16ᵉ en 2026 : où en est-on ?",
    slug: "marche-immobilier-16e-arrondissement-2026",
    excerpt: "Analyse du marché patrimonial du 16ᵉ arrondissement : dynamiques de prix, volumes, secteurs porteurs et profils d'acquéreurs.",
    content: `Le 16ᵉ arrondissement reste l'un des territoires les plus singuliers de Paris, tant par la nature de son bâti que par la typologie de ses acquéreurs. Comprendre son marché suppose de dépasser la seule lecture du prix au mètre carré : chaque micro-secteur, de Trocadéro à Auteuil en passant par la Muette ou Chaillot, obéit à ses propres logiques.

## Une géographie de micro-marchés

La ligne de crête entre Passy et Auteuil, la proximité du Bois de Boulogne, la perspective dégagée sur la Seine ou la Tour Eiffel, la qualité architecturale des immeubles de la fin du XIXᵉ : chacun de ces paramètres crée des segments de marché distincts. Un haussmannien classique avenue Kléber ne se compare pas à une réalisation de Henri Sauvage ou Hector Guimard rue La Fontaine, ni à un immeuble des années trente porte Dauphine.

## Les acquéreurs qui font le marché

Le 16ᵉ attire historiquement trois grandes familles d'acheteurs : des Parisiens cherchant un grand appartement familial de prestige, des investisseurs patrimoniaux à la recherche de biens rares, et une clientèle internationale — souvent expatriés français ou étrangers fortunés — en quête d'un pied-à-terre. Ces profils n'ont pas les mêmes arbitrages : le premier privilégie les écoles et la luminosité, le second la signature architecturale, le troisième la proximité des ambassades et la sécurité.

## Ce qui fait bouger les prix aujourd'hui

Au-delà des taux d'intérêt, les critères déterminants restent la qualité de la copropriété, l'absence ou la présence de travaux de ravalement votés, la performance énergétique — la pression du DPE se fait désormais sentir jusque dans les immeubles de prestige — et bien sûr l'étage, l'exposition, la vue. Un même bien peut voir sa valeur varier de 20 à 30 % selon ces paramètres, indépendamment du marché global.

## Conclusion

Dans un arrondissement où la rareté l'emporte sur le volume, l'accompagnement d'un cabinet qui connaît la typologie des immeubles rue par rue reste le levier principal d'une transaction réussie, à l'achat comme à la vente.`,
  },
  {
    title: "Loi Carrez : ce que tout propriétaire doit vérifier",
    slug: "loi-carrez-proprietaires-verification",
    excerpt: "Superficie privative, exclusions, responsabilité du mesureur : rappel des règles essentielles pour une vente sereine.",
    content: `Depuis 1996, la loi Carrez impose au vendeur d'un lot de copropriété de mentionner précisément la surface privative du bien dans la promesse et l'acte de vente. Derrière cette obligation apparemment technique se cachent des enjeux financiers significatifs, particulièrement dans un arrondissement où le mètre carré se négocie cher.

## Ce que la loi Carrez mesure — et ce qu'elle exclut

La superficie Carrez correspond aux surfaces de plancher closes et couvertes, déduction faite des murs, cloisons, marches et cages d'escalier, gaines, embrasures de portes et de fenêtres. Sont exclues les parties dont la hauteur sous plafond est inférieure à 1,80 mètre, ainsi que les caves, garages, emplacements de stationnement, balcons et terrasses. Un bel appartement sous comble peut ainsi voir sa surface Carrez sensiblement inférieure à sa surface habitable réelle.

## Le risque d'une erreur de mesure

Si l'écart entre la surface annoncée et la surface réelle dépasse 5 %, l'acquéreur peut, dans un délai d'un an après la signature de l'acte, demander une diminution du prix proportionnelle à la différence. Sur un appartement à plusieurs millions d'euros, l'impact peut atteindre des dizaines de milliers d'euros.

## Pourquoi faire appel à un professionnel certifié

Le vendeur peut mesurer lui-même son bien, mais engage alors sa responsabilité pleine. Un diagnostiqueur certifié engage la sienne et son assurance, ce qui protège l'opération. Dans les immeubles anciens, où les murs porteurs sont épais et les refends nombreux, l'écart entre une estimation approximative et une mesure rigoureuse atteint parfois plusieurs mètres carrés.

## En pratique

Faire établir le mesurage Carrez dès la mise en vente — et non au dernier moment — sécurise la négociation et évite toute contestation. C'est l'une des premières étapes que nous recommandons systématiquement à nos vendeurs.`,
  },
  {
    title: "DPE : comment l'anticiper dans un immeuble haussmannien",
    slug: "dpe-immeuble-haussmannien-anticipation",
    excerpt: "Diagnostic de performance énergétique dans le bâti ancien : enjeux, marges de manœuvre et travaux pertinents.",
    content: `Le diagnostic de performance énergétique est devenu, en quelques années, un facteur déterminant de la négociation immobilière. Dans le 16ᵉ arrondissement, où le parc est largement constitué d'immeubles haussmanniens ou Art déco, la question mérite une lecture nuancée.

## Comprendre la méthode de calcul

Le DPE mesure la consommation d'énergie primaire et les émissions de gaz à effet de serre d'un logement. Depuis la réforme de 2021, c'est une méthode conventionnelle qui prévaut, fondée sur les caractéristiques physiques du bâtiment : isolation, type de chauffage, menuiseries, ventilation. Le comportement des occupants n'entre plus en ligne de compte.

## Les spécificités du bâti haussmannien

Les immeubles du XIXᵉ siècle disposent souvent de murs épais en pierre de taille, qui offrent une inertie thermique remarquable — mais que la méthode DPE valorise mal. À l'inverse, les menuiseries d'origine en simple vitrage et les planchers non isolés pèsent lourdement dans le calcul. De nombreux beaux appartements se retrouvent ainsi classés E, F voire G, sans que leur confort réel en soit nécessairement médiocre.

## Les travaux qui améliorent réellement le classement

Le remplacement des menuiseries par du double vitrage performant, l'installation d'une ventilation mécanique contrôlée, et le passage d'un chauffage électrique à un système plus vertueux constituent les leviers les plus efficaces. Dans un immeuble ancien, l'isolation par l'intérieur reste envisageable lot par lot, mais elle réduit la surface habitable et peut altérer les moulures — un arbitrage patrimonial.

## Anticiper avant la vente

Faire établir un DPE en amont de la mise en vente, avec un diagnostiqueur sérieux, permet d'identifier les gisements d'amélioration et, le cas échéant, de réaliser quelques travaux ciblés avant publication de l'annonce. Un passage de F à E ou de E à D a souvent plus d'impact sur le prix final que son coût.`,
  },
  {
    title: "Viager : un outil patrimonial à redécouvrir",
    slug: "viager-outil-patrimonial-a-redecouvrir",
    excerpt: "Bouquet, rente, viager libre ou occupé : comprendre les mécanismes d'un dispositif encore trop souvent mal perçu.",
    content: `Longtemps associé à une image caricaturale, le viager connaît un regain d'intérêt auprès des propriétaires âgés comme des investisseurs patrimoniaux. Bien compris, il offre une réponse élégante à plusieurs problématiques : financer sa retraite, rester chez soi, transmettre différemment.

## Le mécanisme en bref

Le viager permet au vendeur, appelé crédirentier, de céder son bien contre un capital initial — le bouquet — et une rente viagère versée jusqu'à son décès. L'acheteur, le débirentier, acquiert ainsi un bien à un coût d'acquisition immédiat réduit, en contrepartie d'un engagement de versement dont la durée est incertaine.

## Viager occupé ou viager libre

Dans le viager occupé, le vendeur conserve l'usage du bien jusqu'à son décès : c'est la formule la plus fréquente, et elle justifie une décote importante sur la valeur vénale. Dans le viager libre, l'acquéreur dispose immédiatement du logement, qu'il peut louer ou occuper : le bouquet et la rente sont plus élevés, mais la rentabilité est aussi plus rapide.

## Pour qui, et pourquoi

Pour un propriétaire sans héritier direct, ou souhaitant compléter significativement ses revenus sans quitter son cadre de vie, le viager constitue une solution à la fois souple et sécurisante. Pour l'acquéreur, c'est un placement long terme qui suppose une réelle capacité d'épargne mensuelle et une lecture patrimoniale dépassionnée — il ne s'agit pas de parier sur une espérance de vie.

## La rigueur du montage

Le calcul du bouquet et de la rente obéit à des tables actuarielles précises, croisées avec l'âge du vendeur, la valeur du bien, et le caractère occupé ou libre. Faire appel à un cabinet qui maîtrise ces paramètres est essentiel : une erreur sur la valeur d'occupation peut déséquilibrer durablement l'opération pour l'une ou l'autre des parties.`,
  },
  {
    title: "Fiscalité du non-résident propriétaire à Paris",
    slug: "fiscalite-non-resident-proprietaire-paris",
    excerpt: "Revenus fonciers, plus-values, IFI : repères fiscaux pour les propriétaires établis à l'étranger.",
    content: `Le 16ᵉ arrondissement concentre une proportion significative de propriétaires non-résidents, Français expatriés ou étrangers disposant d'un pied-à-terre parisien. La fiscalité applicable à ces situations obéit à des règles spécifiques qu'il importe de bien cerner avant toute opération.

## Revenus locatifs : quelle imposition ?

Un non-résident qui loue son bien parisien est imposé en France sur les revenus fonciers nets, avec un taux minimum d'imposition fixé à 20 % jusqu'à un certain seuil, puis 30 % au-delà. Les prélèvements sociaux (17,2 %) s'appliquent en principe, mais les résidents d'un État de l'Espace économique européen ou de Suisse peuvent être exonérés de la CSG et de la CRDS, sous conditions.

## Plus-values à la revente

La cession d'un bien immobilier français par un non-résident est soumise à la plus-value immobilière française, avec des abattements pour durée de détention comparables à ceux des résidents. Certains pays disposent de conventions fiscales qui neutralisent la double imposition : il est impératif d'en vérifier les termes avant toute vente.

## L'impôt sur la fortune immobilière

L'IFI concerne tout propriétaire — résident ou non — dont le patrimoine immobilier net taxable dépasse 1,3 million d'euros. Un non-résident n'est toutefois imposable que sur ses biens situés en France, ce qui peut rapidement devenir le cas avec un bel appartement parisien. Les dettes affectées au bien, notamment les emprunts en cours, viennent en déduction.

## Anticiper avec les bons interlocuteurs

Chaque situation — pays de résidence, régime matrimonial, détention en direct ou via une SCI — appelle un arbitrage spécifique. Nous travaillons régulièrement avec des notaires et fiscalistes spécialisés dans les questions transfrontalières, afin que nos clients internationaux sécurisent leur opération dans sa dimension juridique autant que patrimoniale.`,
  },
];

// ── Testimonials : purge + insert ─────────────────────
console.log("\n🗣  Testimonials…");
const { error: delTestErr } = await supabase
  .from("testimonials")
  .delete()
  .neq("id", "00000000-0000-0000-0000-000000000000");
if (delTestErr) console.error("  purge testimonials :", delTestErr.message);

const { data: tIns, error: tErr } = await supabase
  .from("testimonials")
  .insert(testimonials.map((t) => ({ ...t, is_published: true })))
  .select("id");
if (tErr) {
  console.error("  insert testimonials :", tErr.message);
} else {
  console.log(`  ✓ ${tIns?.length ?? 0} témoignages insérés`);
}

// ── Posts : upsert sur slug ────────────────────────────
console.log("\n📝 Articles blog…");
// Get an author (first admin agent)
const { data: authors } = await supabase
  .from("agents")
  .select("id")
  .eq("is_active", true)
  .order("role", { ascending: true })
  .limit(1);
const authorId = authors?.[0]?.id || null;

const rows = posts.map((p) => ({
  ...p,
  is_published: true,
  author_id: authorId,
}));

const { data: pIns, error: pErr } = await supabase
  .from("posts")
  .upsert(rows, { onConflict: "slug" })
  .select("id, slug");
if (pErr) {
  console.error("  upsert posts :", pErr.message);
} else {
  console.log(`  ✓ ${pIns?.length ?? 0} articles upsertés`);
  pIns?.forEach((p) => console.log(`     - ${p.slug}`));
}

// ── Revalidate ────────────────────────────────────────
try {
  const r = await fetch("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tag: "blog",
      paths: ["/blog", "/temoignages", "/"],
      secret: env.REVALIDATE_SECRET || "dev-revalidation-secret-change-in-production",
    }),
  });
  console.log(`\n🔄 Revalidate: HTTP ${r.status}`);
} catch (e) {
  console.log(`\n⚠️  Revalidate: ${e.message}`);
}
