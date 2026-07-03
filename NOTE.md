

Ma communauté (Orford Sur Le Lac) à des structures à coté de la plage pour gérer different types d'embarcation des membres.
Par example, des Kayaks, Canoes et Planches. Les structures sont des simples pontres de bois de constructions qui forme
des emplacements à embarcation. IL y a des structures que je qualifierais d'horizontal, qui ont donc plusieurs niveaux
(jusqu'a 4) plus ou moins pret du sol. Les structures que je qualifie de vertical, permetent de ranger des planches
(paddle, SUP...) verticalement, il n'y a pas de 'niveau'. Chaque emplacement est identifié par un numéro. Les numéros sont
unique entre toutes les structures, donc il n'y aura jamais deux numeros identiques sur deux structures differentes. Les
numeros sont sequentiel par niveau, mais pas forcement par structure, par example, pour une Structure X, le premier niveau
peut avoir des numeros de 1 à 5, le deuxieme niveau de 6 à 10 et le troisieme niveau de 116 à 120.


Les regles de la communauté sont tres simple. Normalement chaque adresse dans la communauté (environ 180) ont le droit à 2
emplacements. Il faut faire une demande pour avoir un emplacement. Le fait est qu'avec les annees, il y a eut des
exceptions ou des mauvaises gestions et certaines adresses ont 3 voir 4 emplacements. C'est une des choses que l'on devra
gérer.

Aujourd'hui tout est gérer par email/telephone, un membre du comité à un fichier Excel et garde une liste des emplacements
et qui est le 'propriétaire'.

Je souhaite créer un petit site (application) qui aidera les gens à gérer la gestion des emplacements d'embarcation.

Les utilisateurs et administrateurs sont des boomers pour la tres grande majorité. Je souhaite donc quelque chose d'épuré
et de très simple avec une valeur ajouté très claire pour leur travail.

Je pense donc que les datas doivent rester dans un document de type excel (je penche plus pour Google Spreadsheet, qui me
semble plus facile à partager et gérer les authorisations si l'on doit donner des authorizations parcituliére au document
pour service de bases de donnees a des scripts et partager le fichier entre membre du commité d'organisation de la
communauté.

Les fonctionalités que je vois pour l'instant sont les suivantes:
- un formulaire utiliser directement par les membres ou par les admins du commité pour entré les demandent de nouvelle
emplacement d'embarcation. Cette page serait accesible par tout le monde. 
Peut etre trouvé un moyen de notifié les membres du commité quand une nouvelle demande est faite.
Peut etre que le mail donne aussi les suggestions d'embarquement de reponses, pour pouvoir aller a la demande directement sur le site
ou meme d'accepter un emplacement suggerer afin de proceder à la demande.
Il est important de garder la trace des demandes et les decisions, aussi pour voir revert une decision faciement.
- Une ou plusieurs pages d'administrations accesible seulements aux personnes du commité (peut etre une simple protection par mot de passe suffit dans un premier temps)
-- une page pour voir et repondre aux demandes (avec idees d'ordre chronologique) et peut etre donnees des suggestions
d'emplacements (les suggestions en fonction du type d'embarcation, les suggestions peuvent etre basé sur la hauteur du niveau, si c'est pour un emplacement horizontal, les
gens avec des problemes de mobilité prefererons des emplacements plus bas. Et si jamais on a cette chance, proposé des
emplacements sur la meme structure, si il y a de la place.
-- Il faut aussi pouvoir tres facilement edité les informations par emplacement afin de maintenir l'intégriter des
données.
-- Il faut pouvoir facilement trouvé les adresses qui ont plus de 2 emplacements afin de commencer la communication pour
recuperer un emplacement (en ce moment la quasi totalité des emplacements sont prit et c'est un probleme).
-- Plus tard il serait interessant de creer un workflow LLM qui permetterais de voir si les données d'occupations sont bonne
en faisant un audit a partir de photos des sturctures. On va pouvoir extraire les numeros d'emplacement des photos et determiner si 
L'emplacement est occupé ou pas, comparé avec les données enregistré afin de réperer les problemes: emplacements qui devrait etre libre
mais qui ne le sont pas, et emplacement libre alors qu'ils sont resevé.

Je pense que les membres doivent etre identifié par leur adresse, si John fait une demande pour 234 Rue du Pré, et Marie
fait aussi une demande pour 234 Rue du Pré, les deux emplacements doivent appartenir au 234 Rue du Pré.

Il y a un nombre limité de rue dans la communauté donc on peut donner la liste de 8 à 10 rue afin d'assainiser
l'identifiant par adresse. (Le numero de la rue ne devrait pas depasser 1000).

J'aimerais que le deployment de ce site reste extrément simple. Un commit envoyé sur un repo github = un déploiement (ex: github pages)
J'aimerais que si on a besoin de parametres de configurations du site, que ces données viennent d'une ou plusieurs onglet specific de la google sheet, ce qui 
permeterais de gerer tout le site a partir d'un unique document.
