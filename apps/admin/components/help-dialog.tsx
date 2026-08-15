"use client";

import * as React from "react";
import {
  Building2,
  Bell,
  Mail,
  MessageSquare,
  Users,
  LifeBuoy,
  CircleHelp,
} from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";

type FaqItem = {
  q: string;
  a: React.ReactNode;
};

type FaqSection = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FaqItem[];
};

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mono w-5 shrink-0 text-right tabular-nums text-muted-foreground/60">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ol>
  );
}

const SECTIONS: FaqSection[] = [
  {
    key: "biens",
    label: "Biens",
    icon: Building2,
    items: [
      {
        q: "Comment ajouter un nouveau bien ?",
        a: (
          <>
            <p>
              Dans la section <strong>Biens</strong>, cliquez sur le bouton{" "}
              <em>« Ajouter un bien »</em> en haut à droite. Remplissez les
              informations du bien, glissez-déposez les photos, puis cochez{" "}
              <em>Publier</em> pour le rendre visible sur le site.
            </p>
            <p>
              Tant que <em>Publier</em> n&apos;est pas activé, le bien reste
              en brouillon : il n&apos;apparaît ni sur le site ni dans les
              alertes email.
            </p>
          </>
        ),
      },
      {
        q: "Comment mettre un bien en vedette sur la page d'accueil ?",
        a: (
          <p>
            Ouvrez la fiche du bien et activez le champ{" "}
            <em>« Mettre en vedette »</em>. Les biens en vedette sont
            affichés en priorité sur la page d&apos;accueil et dans le hero
            tournant. Conseil : limitez à 3-6 biens en vedette pour garder
            la sélection lisible.
          </p>
        ),
      },
      {
        q: "J'ai modifié un bien, mais le site public affiche encore l'ancienne version",
        a: (
          <p>
            Les pages du site public sont mises en cache pour les rendre
            plus rapides. Après une modification, il peut s&apos;écouler
            jusqu&apos;à une minute avant que le changement soit visible
            pour les visiteurs. Si au bout de quelques minutes le site
            n&apos;est toujours pas à jour, rafraîchissez la page avec{" "}
            <em>Ctrl + F5</em> (ou <em>Cmd + Shift + R</em> sur Mac).
          </p>
        ),
      },
      {
        q: "Un bien a été vendu, je le supprime ou je le dépublie ?",
        a: (
          <>
            <p>
              <strong>Dépublier</strong> (recommandé) : décochez{" "}
              <em>Publier</em> sur la fiche. Le bien disparaît du site
              public mais reste dans votre espace admin, avec son
              historique (contacts reçus, photos, documents). Utile pour
              garder une trace ou republier plus tard.
            </p>
            <p>
              <strong>Supprimer</strong> : à réserver aux biens créés par
              erreur ou aux doublons — l&apos;action est définitive.
            </p>
          </>
        ),
      },
      {
        q: "Un bien a des champs manquants (DPE, année de construction, chauffage…)",
        a: (
          <p>
            C&apos;est normal et ça n&apos;empêche rien. Le site public
            affiche uniquement les informations disponibles — une fiche
            incomplète reste publiable et correctement présentée. Vous
            pouvez compléter les champs à tout moment en éditant la fiche.
          </p>
        ),
      },
    ],
  },
  {
    key: "contacts",
    label: "Messages & estimations",
    icon: MessageSquare,
    items: [
      {
        q: "Comment répondre à un message reçu ?",
        a: (
          <>
            <p>
              Dans <strong>Contacts</strong>, cliquez sur un message pour
              ouvrir son détail. Un champ de réponse s&apos;affiche en bas
              du dialog : tapez votre message, validez, le client reçoit un
              email depuis l&apos;adresse de l&apos;agence.
            </p>
            <p>
              Toutes vos réponses sont archivées dans le fil de
              conversation, visible à la prochaine ouverture du message.
            </p>
          </>
        ),
      },
      {
        q: "Comment savoir quels messages je n'ai pas encore traités ?",
        a: (
          <p>
            Un compteur rouge apparaît dans la sidebar à côté de{" "}
            <strong>Contacts</strong> tant qu&apos;il reste des messages au
            statut <em>Nouveau</em>. Changez le statut en{" "}
            <em>Traité</em> ou <em>Archivé</em> depuis le badge de statut
            pour faire disparaître le compteur.
          </p>
        ),
      },
      {
        q: "Le client reçoit-il une confirmation quand il envoie un message ?",
        a: (
          <p>
            Oui. Dès qu&apos;un formulaire est soumis, le client reçoit
            automatiquement un email de confirmation dans le style de
            l&apos;agence (« Nous avons bien reçu votre message »). Idem
            pour les demandes d&apos;estimation. Vous n&apos;avez rien à
            faire de particulier.
          </p>
        ),
      },
      {
        q: "Comment traiter une demande d'estimation ?",
        a: (
          <>
            <p>
              Dans <strong>Estimations</strong>, ouvrez la demande pour voir
              l&apos;adresse, le type de bien et les informations données
              par le client. Contactez-le par téléphone ou email (les deux
              sont cliquables dans le dialog) pour caler un rendez-vous sur
              place.
            </p>
            <p>
              Mettez ensuite le statut à jour (<em>En cours</em>,{" "}
              <em>Chiffrée</em>, <em>Perdue</em>…) pour suivre
              l&apos;avancement côté équipe.
            </p>
          </>
        ),
      },
    ],
  },
  {
    key: "alertes",
    label: "Alertes email",
    icon: Bell,
    items: [
      {
        q: "À quoi servent les alertes email ?",
        a: (
          <p>
            Un visiteur du site public peut s&apos;abonner pour recevoir un
            email dès qu&apos;un bien correspondant à ses critères (type,
            ville, budget, surface, nombre de pièces) est publié. Côté
            admin, vous voyez la liste des abonnés, leurs critères et
            l&apos;historique des biens pour lesquels un email leur a été
            envoyé.
          </p>
        ),
      },
      {
        q: "Quand un email d'alerte est-il envoyé ?",
        a: (
          <>
            <p>
              À chaque fois qu&apos;un bien est <strong>publié</strong> ou
              modifié en étant déjà publié, chaque alerte active est
              vérifiée : si les critères correspondent, un email part
              aussitôt.
            </p>
            <p>
              Un même bien ne déclenchera qu&apos;<em>un seul</em> email
              par abonné, même si vous le modifiez plusieurs fois ensuite.
              Pas de risque de spam.
            </p>
          </>
        ),
      },
      {
        q: "Un abonné peut-il se désinscrire lui-même ?",
        a: (
          <p>
            Oui. Chaque email contient deux liens en bas : « Désactiver
            cette alerte » (ne désactive que l&apos;alerte concernée) et{" "}
            « Me désabonner de toutes » (désactive toutes les alertes de
            cette adresse email). Dans les deux cas, l&apos;abonné arrive
            sur une page de confirmation de votre site, et l&apos;alerte
            bascule immédiatement en <em>Inactive</em> côté admin.
          </p>
        ),
      },
      {
        q: "Comment voir quels biens ont déjà été envoyés à un abonné ?",
        a: (
          <p>
            Dans <strong>Alertes</strong>, cliquez sur l&apos;email de
            l&apos;abonné ou sur <em>« Ouvrir le détail »</em> dans le menu{" "}
            <strong>⋯</strong>. Le dialog récapitule tous les critères
            posés et affiche la liste des biens pour lesquels un email a
            déjà été envoyé, avec un lien direct vers chaque fiche.
          </p>
        ),
      },
      {
        q: "Je veux mettre en pause une alerte sans la supprimer",
        a: (
          <p>
            Depuis le menu <strong>⋯</strong> de la ligne, choisissez{" "}
            <em>« Désactiver »</em>. L&apos;alerte passe en{" "}
            <em>Inactive</em> : aucun email ne part plus, mais les
            critères et l&apos;historique sont conservés. Vous pouvez la{" "}
            <em>« Réactiver »</em> à tout moment depuis le même menu.
          </p>
        ),
      },
    ],
  },
  {
    key: "emails",
    label: "Emails automatiques",
    icon: Mail,
    items: [
      {
        q: "Quels emails la plateforme envoie-t-elle automatiquement ?",
        a: (
          <>
            <p>Huit types d&apos;email sont envoyés automatiquement :</p>
            <Steps
              items={[
                <>
                  <strong>Confirmation de contact</strong> — au client, dès
                  qu&apos;il envoie un message.
                </>,
                <>
                  <strong>Notification de contact</strong> — à votre équipe,
                  à chaque nouveau message (si activé).
                </>,
                <>
                  <strong>Réponse à un contact</strong> — au client, quand
                  vous lui répondez depuis le dialog.
                </>,
                <>
                  <strong>Confirmation d&apos;estimation</strong> — au
                  client, dès qu&apos;il envoie une demande.
                </>,
                <>
                  <strong>Notification d&apos;estimation</strong> — à votre
                  équipe, à chaque nouvelle demande (si activé).
                </>,
                <>
                  <strong>Alerte bien</strong> — aux abonnés qui
                  correspondent aux critères d&apos;un nouveau bien.
                </>,
                <>
                  <strong>Invitation agent</strong> — à un collègue que vous
                  ajoutez à l&apos;équipe.
                </>,
                <>
                  <strong>Bienvenue agent</strong> — à un collègue dès
                  qu&apos;il active son compte.
                </>,
              ]}
            />
          </>
        ),
      },
      {
        q: "Comment configurer les emails de notification pour l'équipe ?",
        a: (
          <p>
            Allez dans <strong>Paramètres</strong>, section{" "}
            <em>Notifications admin</em>. Cochez les événements pour
            lesquels vous voulez recevoir un email (nouveau message, nouvel
            estimation, nouveau bien publié). Renseignez ensuite l&apos;
            adresse de destination — par défaut, l&apos;email principal de
            l&apos;agence. Un bouton <em>« Envoyer un test »</em> permet de
            vérifier que tout arrive bien.
          </p>
        ),
      },
      {
        q: "Tous les emails utilisent le design de mon agence ?",
        a: (
          <p>
            Oui. Les huit templates reprennent la charte du site public :
            fond ivoire, titres en serif, filets discrets, ton éditorial.
            L&apos;entête mentionne toujours le nom de votre agence, et le
            bas des emails signe au nom de l&apos;équipe.
          </p>
        ),
      },
    ],
  },
  {
    key: "equipe",
    label: "Équipe & compte",
    icon: Users,
    items: [
      {
        q: "Comment inviter un nouvel agent ?",
        a: (
          <>
            <p>
              Dans <strong>Équipe</strong>, cliquez sur{" "}
              <em>« Inviter un agent »</em>. Renseignez son prénom, nom et
              email, puis envoyez — il reçoit un email d&apos;invitation
              avec un lien d&apos;activation unique.
            </p>
            <p>
              Le lien expire après 24 heures. Si votre collègue ne
              l&apos;utilise pas à temps, supprimez l&apos;invitation et
              relancez-en une.
            </p>
          </>
        ),
      },
      {
        q: "Quelle différence entre un admin et un agent ?",
        a: (
          <>
            <p>
              <strong>Admin</strong> : accès complet. Peut gérer
              l&apos;équipe (inviter, retirer), modifier les paramètres
              sensibles (notifications admin, coordonnées de l&apos;agence)
              et accéder à toutes les sections.
            </p>
            <p>
              <strong>Agent</strong> : accès à tout le contenu et aux
              messages, sans pouvoir toucher à l&apos;équipe ni aux
              paramètres de l&apos;agence. Idéal pour les collaborateurs
              qui n&apos;ont pas à gérer la structure.
            </p>
          </>
        ),
      },
      {
        q: "Comment retirer un agent qui a quitté l'agence ?",
        a: (
          <p>
            Dans <strong>Équipe</strong>, ouvrez la fiche de l&apos;agent
            et désactivez son compte (toggle <em>Actif</em>). Il ne pourra
            plus se connecter, mais son historique (biens créés, messages
            traités) reste intact. La suppression définitive est possible
            si aucun contenu n&apos;est rattaché à son compte.
          </p>
        ),
      },
      {
        q: "Comment mettre à jour mon profil (photo, bio, téléphone) ?",
        a: (
          <p>
            Dans <strong>Profil</strong> (accessible via le menu utilisateur
            en bas de la sidebar), vous pouvez modifier votre photo, une
            courte biographie, votre téléphone direct. Ces informations
            apparaissent sur le site public dans la section « À propos ».
          </p>
        ),
      },
    ],
  },
];

export function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          maxWidth: "min(42rem, calc(100vw - 2rem))",
          maxHeight: "min(85vh, 50rem)",
        }}
        className="flex flex-col overflow-hidden"
      >
        <DialogHeader className="space-y-2">
          {/* Même icône CircleHelp que l'entrée « Aide » de la sidebar —
              ancrage visuel direct, l'utilisateur reconnaît où il vient
              de cliquer. */}
          <div className="flex items-center gap-2">
            <CircleHelp className="size-4 text-foreground/70" />
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {clientConfig.agencyName} · Administration
            </span>
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Centre d&apos;aide
          </DialogTitle>
          <DialogDescription>
            Les questions les plus fréquentes, par thème. Si vous ne trouvez
            pas votre réponse, l&apos;équipe support est joignable en bas.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollbar-thin min-h-0 flex-1 -mx-1 overflow-y-auto px-1">
          <div className="space-y-6 pb-2">
            {SECTIONS.map((section) => (
              <section key={section.key} className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  <section.icon className="size-3.5 text-foreground/60" />
                  {section.label}
                </h3>
                <Accordion
                  className="rounded-lg border bg-muted/20 px-3"
                  // Base UI `Accordion.Root` sans `value` = controlled-less,
                  // plusieurs items ouvrables indépendamment (par défaut).
                >
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${section.key}-${i}`}
                      className="last:border-b-0"
                    >
                      <AccordionTrigger className="pr-2 text-sm">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            {/* Appel au support en fin — écrit à Kobau (éditeur de la
                plateforme), pas à l'agence elle-même. */}
            <div className="rounded-lg border border-dashed bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <LifeBuoy className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Besoin d&apos;un coup de main ?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Écrivez à l&apos;équipe Kobau à{" "}
                    <a
                      href="mailto:contact@kobau.fr"
                      className="text-foreground underline underline-offset-2"
                    >
                      contact@kobau.fr
                    </a>
                    , on répond dans la journée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
