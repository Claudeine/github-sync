<h1 align="center">github-sync</h1>

<p align="center">
  <em>Un projet, plusieurs ordinateurs, toujours synchronisés grâce à GitHub.</em>
</p>

<p align="center">
  <sub><a href="README.md">English</a> &middot; Français</sub>
</p>

---

Vous travaillez sur le même projet depuis un portable et un ordinateur fixe. Vous oubliez d'envoyer vos modifications avant de quitter l'un, de les récupérer sur l'autre, et Claude repart d'une ancienne version.

**github-sync** est un mod pour [Claude Code](https://code.claude.com) qui garde un projet synchronisé entre vos ordinateurs grâce à GitHub. Il récupère la dernière version quand vous ouvrez une conversation, envoie votre travail en un clic, et met tout en place pour vous, sur un nouveau projet comme sur une deuxième machine.

## Ce qu'il fait

- **Configure un projet en une commande.** `/github-sync:setup` vérifie que les outils sont présents, puis publie le dossier actuel sur GitHub, ou récupère un projet qui s'y trouve déjà (votre deuxième machine).
- **Récupère automatiquement.** À chaque ouverture ou reprise d'une conversation dans un projet relié, la dernière version est récupérée depuis GitHub avant que Claude lise votre message.
- **Envoie en un clic.** **⬆** enregistre vos modifications (un commit avec un message clair) et les envoie sur GitHub, après avoir vérifié les fichiers très volumineux et les fichiers sensibles (clés, mots de passe, fichiers `.env`, jetons).
- **Protège vos secrets.** Un fichier sensible n'est envoyé qu'avec votre accord, après une explication du risque, et seulement sur un dépôt privé. Les fichiers sensibles exclus par `.gitignore` (que git ignore sans rien dire) sont signalés aussi, puisqu'ils manqueraient sur l'autre ordinateur ; ceux que vous choisissez de garder hors de GitHub ne vous sont plus redemandés. Sur un dépôt public, l'envoi est refusé : Claude range ces fichiers dans un zip, en dehors du projet et avec leurs dossiers, à transférer à la main et à décompresser à la racine du projet sur l'autre ordinateur. Les fichiers de plus de 50 Mo reçoivent le même traitement (GitHub refuse au-delà de 100 Mo). Vous pouvez déclarer vos propres fichiers sensibles en l'écrivant simplement à Claude, par exemple « Déclare le fichier config/api.json comme sensible » : la liste est gardée dans `.github-sync-sensitive` (des noms seulement) et suit le projet sur tous vos ordinateurs. Le zip garde toujours le même nom et est refait à chaque ⬆ si l'un de ces fichiers a changé ; vous êtes alors prévenu qu'il faut le transférer à nouveau.
- **Ne force jamais rien.** Si GitHub contient des modifications plus récentes, ou en cas de conflit, rien n'est écrasé : on vous explique ce qui bloque et comment le résoudre.
- **Vous dit ce qui s'est passé.** Une courte notification après chaque pull et push : heure, version, nombre de fichiers. Les échecs sont toujours signalés, même notifications coupées.
- **Parle français ou anglais.** Les boutons, les notifications et les réponses de Claude dans les commandes suivent la langue choisie.

## La barre

Au-dessus de la zone de saisie, dans chaque projet relié à GitHub :

```
⬇ ⬆   ⬇ Auto ✓   ⬆ Auto ×   ⚠︎      Notifications ✓   ⓘ   FR
```

| Bouton | Ce qu'il fait |
| --- | --- |
| **⬇** | Pull : récupère la dernière version depuis GitHub (`/github-sync:pull`). |
| **⬆** | Push : enregistre et envoie vos modifications sur GitHub (`/github-sync:push`). |
| **Notifications ✓ / ×** | Activées / coupées. Coupées, les réussites ne sont plus annoncées, les échecs le sont toujours. |
| **⬇ Auto ✓ / ×** | Pull automatique, activé par défaut. Coupé, rien n'est récupéré à l'ouverture d'une conversation ; ⬇ fonctionne toujours. |
| **⬆ Auto ✓ / ×** | Push automatique, coupé par défaut. Activé, après chaque réponse de Claude qui modifie le dossier, les modifications sont enregistrées et envoyées sur GitHub. Il n'envoie jamais de fichier sensible (`.env`, clé, `wp-config.php`…, ou déclaré avec ⚠︎) ni de fichier de plus de 50 Mo, même un fichier déjà autorisé : dès qu'un tel fichier a changé, rien n'est envoyé et vous êtes invité à passer par ⬆. |
| **⚠︎** | Liste les fichiers sensibles et volumineux du projet et ce qui a été décidé pour chacun ; pour en déclarer d'autres, écrivez-le simplement à Claude (« Déclare le fichier config/api.json comme sensible »). |
| **ⓘ** | Ouvre une notice : le rôle de chaque bouton, et comment mettre à jour ou désinstaller le mod. |
| **FR / EN** | Affiche la langue actuelle ; un clic passe du français à l'anglais et inversement. |

Dans un dossier qui n'est pas relié à GitHub, la barre affiche un seul bouton à la place : **Configurer la synchro GitHub**.

Les réglages valent pour tout l'ordinateur, pour tous les projets.

## Installation

Le plus simple : dans une conversation Claude (application ou terminal), demandez

```
Installe https://github.com/Claudeine/github-sync
```

Ou bien, dans une session Claude Code lancée depuis un terminal :

```
/plugin install github-sync --marketplace Claudeine/github-sync
```

Répondez `y` pour ajouter la marketplace, puis choisissez la portée « user ». Ou directement depuis un terminal :

```bash
claude plugin install github-sync --marketplace Claudeine/github-sync
```

Une fois installé pour votre compte, le mod fonctionne aussi dans l'application Claude, dans toutes les conversations. À installer une fois sur chaque ordinateur.

## Première utilisation

Ouvrez une conversation dans le dossier du projet et cliquez sur **Configurer la synchro GitHub** (ou tapez `/github-sync:setup`).

**1. Les outils sont d'abord vérifiés**, dans cet ordre, en s'arrêtant au premier qui manque :

| Outil | À quoi il sert | S'il manque |
| --- | --- | --- |
| git | fait la synchronisation | Claude vous indique l'installateur officiel ou la commande adaptée à votre système |
| GitHub CLI (`gh`) | dialogue avec GitHub : liste et crée les dépôts, connexion | Claude vous guide pas à pas avec le téléchargement officiel ([cli.github.com](https://cli.github.com)) : quelle version prendre selon votre Mac (Intel ou Apple Silicon), comment l'installer (y compris quand c'est un `.zip` sans installateur), où taper les commandes, comment vérifier. Homebrew n'est pas nécessaire |
| la connexion à GitHub | donne accès à vos dépôts | vous lancez vous-même `gh auth login`, Claude vous indique la réponse à chacune de ses questions ; il ne saisit jamais de mot de passe |
| git utilise cette connexion | permet à git de faire pull et push avec | Claude lance `gh auth setup-git` |
| votre nom et votre e-mail | inscrits sur chaque commit | Claude vous les demande et les enregistre |

Les commandes qui demandent des droits administrateur (`sudo`) ou ouvrent une fenêtre système vous sont données à lancer vous-même. GitHub Desktop n'est pas nécessaire.

**2. Ensuite, vous choisissez :**

- **Publier ce dossier sur GitHub** : un nouveau dépôt (privé par défaut) ou un dépôt existant encore vide. Un `.gitignore` de base est ajouté s'il n'y en a pas, et les fichiers sont vérifiés avant le premier envoi.
- **Récupérer un projet qui existe déjà sur GitHub** : Claude liste vos dépôts, vous en choisissez un, il est cloné. Si le dossier contient déjà des fichiers, le projet va dans un sous-dossier au lieu d'être mélangé avec eux.

**Sur votre deuxième ordinateur :** installez le mod, ouvrez une conversation dans un dossier vide, cliquez sur **Configurer la synchro GitHub**, choisissez *Récupérer un projet qui existe déjà sur GitHub* et sélectionnez-le. C'est tout : les deux ordinateurs restent désormais synchronisés.

## Commandes

| Commande | Ce qu'elle fait |
| --- | --- |
| `/github-sync:setup` | Vérifie les outils et relie le dossier à GitHub. |
| `/github-sync:pull` | Récupère les dernières modifications. |
| `/github-sync:push [message]` | Enregistre et envoie les modifications ; le message est facultatif. |
| `/github-sync:sensitive` | Liste les fichiers sensibles et volumineux (comme ⚠︎). Pour déclarer un fichier, changer un choix ou refaire le zip, écrivez-le simplement à Claude. |

## Comment ça marche

- **Le pull automatique** se fait dans le mod à l'ouverture ou à la reprise d'une conversation, uniquement dans un dossier dont le dépôt git a une adresse GitHub (`origin`). Il utilise `git pull --ff-only` : il ne fait qu'avancer, et s'arrête sans rien toucher si votre travail local et celui de GitHub ont divergé.
- **Le push automatique** (s'il est activé) se fait dans le mod, sans passer par Claude, donc sans consommer votre limite d'utilisation : le message de commit est générique (« Envoi automatique : N fichier(s) modifié(s) ») et il ne force jamais.
- **Pull et push sont des commandes Claude** : Claude peut ainsi expliquer un refus simplement, rédiger le message de commit et vérifier l'absence de secrets avant l'envoi.
- **Les réglages sont enregistrés dans votre configuration git globale** (`github-sync.notifications`, `github-sync.autopull`, `github-sync.autopush`, `github-sync.lang`). Ils survivent aux redémarrages et fonctionnent de la même façon sur tous les systèmes.
- **Rien ne tourne en dehors de git et de GitHub CLI** : aucun script, aucun serveur, aucun appel réseau propre au mod.

## Bonnes habitudes

- Cliquez sur **⬆** avant de quitter un ordinateur, et laissez le pull automatique faire le reste sur l'autre.
- Évitez de travailler sur les deux ordinateurs en même temps sans synchroniser : c'est ainsi que naissent les conflits.
- Une conversation restée ouverte ne refait pas de pull : cliquez sur **⬇** en y revenant.
- Les conversations elles-mêmes ne sont pas synchronisées (elles restent sur chaque ordinateur). Écrivez ce qui doit durer (décisions, avancement) dans les fichiers du projet, par exemple `CLAUDE.md`.

## Compatibilité

- Claude Code dans un terminal et dans l'application Claude.
- macOS, Windows et Linux : le mod ne dépend que de git et de GitHub CLI. Testé sur macOS pour l'instant.
- Fonctionne seul : il n'a besoin d'aucun autre mod.

## Mise à jour

Dans une conversation Claude, demandez « Mets à jour le plug-in github-sync », ou dans un terminal :

```bash
claude plugin update github-sync
```

Puis rouvrez Claude.

## Désinstallation

```
/plugin uninstall github-sync
```

Pour supprimer aussi ses réglages :

```bash
git config --global --remove-section github-sync
```

Vos projets et leurs dépôts GitHub restent intacts.

## Licence

MIT
