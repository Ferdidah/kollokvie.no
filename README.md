# kollokvie.no


Git Samarbeid Guide for Team
Velkommen til vårt team repository! Denne guiden hjelper deg i gang med Git samarbeid. Hvis du er ny til Git, ikke bekymre deg - vi går gjennom alt steg for steg.
🚀 Kom i gang
1. Innledende oppsett (Kun én gang)
Før du begynner å jobbe med Git, konfigurer din identitet:
bash# Sett ditt navn og e-post (bruk ditt ekte navn og jobb e-post)
git config --global user.name "Ditt Fulle Navn"
git config --global user.email "din.epost@firma.no"
2. Hent prosjektet
Klon dette repositoryet til din lokale maskin:
bashgit clone <repository-url>
cd <repository-navn>
📋 Daglig arbeidsflyt
Sjekk hva som skjer
Start alltid med å sjekke gjeldende tilstand:
bash# Se hvilke filer som er endret
git status

# Se de faktiske endringene i detalj
git diff
Gjøre endringer
Følg denne enkle syklusen:
bash# 1. Sørg for at du er på main-branchen og har siste endringer
git checkout main
git pull origin main

# 2. Opprett en ny branch for din funksjon
git checkout -b feature/din-funksjon-navn

# 3. Gjør endringene dine til filer...

# 4. Legg til endringene dine i staging
git add .                    # Legg til alle endrede filer
# ELLER
git add spesifikk-fil.js     # Legg til spesifikke filer kun

# 5. Commit endringene dine med en tydelig melding
git commit -m "Legg til brukerautentisering funksjon"

# 6. Push branchen din til GitHub
git push origin feature/din-funksjon-navn
🌿 Jobbe med branches
Branch håndtering
bash# Opprett og bytt til en ny branch
git checkout -b feature/ny-funksjon

# Bytt til en eksisterende branch
git checkout branch-navn

# Se alle branches
git branch

# Slett en branch (etter at den er merget)
git branch -d feature/gammel-funksjon
Branch navnekonvensjon
Bruk beskrivende navn:

feature/bruker-innlogging - for nye funksjoner
bugfix/header-styling - for feilrettinger
hotfix/sikkerhets-patch - for kritiske rettelser

🔄 Holde seg oppdatert
Hold koden din oppdatert
bash# Hent siste endringer fra remote repository
git fetch

# Oppdater din nåværende branch med remote endringer
git pull origin main

# Oppdater din feature branch med siste main branch
git checkout main
git pull origin main
git checkout feature/din-funksjon
git merge main
🤝 Samarbeidsprosess
Standard arbeidsflyt

Start med siste kode

bash   git checkout main
   git pull origin main

Opprett din feature branch

bash   git checkout -b feature/fantastisk-funksjon

Jobb og commit regelmessig

bash   # Lag små, fokuserte commits
   git add .
   git commit -m "Legg til validering for innloggingsskjema"

Push branchen din

bash   git push origin feature/fantastisk-funksjon

Åpne en Pull Request

Gå til GitHub/GitLab
Klikk "New Pull Request"
Velg din branch for å merge inn i main
Legg til en tydelig beskrivelse av endringene dine
Be om reviewers


Etter godkjenning og merge, rydd opp

bash   git checkout main
   git pull origin main
   git branch -d feature/fantastisk-funksjon
📚 Nyttige kommandoer
Se historikk
bash# Se commit historikk i et fint format
git log --oneline --graph --decorate

# Se hvem som endret hva i en fil
git blame filnavn.js

# Se endringer i en spesifikk commit
git show <commit-hash>
Rette vanlige feil
bash# Fjern filer fra staging (behold endringene dine)
git reset filnavn.js

# Forkast endringer til en fil (⚠️ Kan ikke angres!)
git checkout -- filnavn.js

# Rett din siste commit melding (før pushing)
git commit --amend -m "Bedre commit melding"

# Angre siste commit men behold endringer
git reset --soft HEAD~1
⚠️ Viktige regler
Gjør ✅

Alltid pull før du starter nytt arbeid
Bruk beskrivende commit meldinger
Lag små, fokuserte commits
Test endringene dine før commit
Bruk Pull Requests for kodegjennomgang
Hold branches oppdatert med main

Ikke gjør ❌

Ikke commit direkte til main branch
Ikke push ødelagt kode
Ikke bruk vage commit meldinger som "fixes"
Ikke jobb på flere funksjoner i én branch
Ikke force push (git push --force) med mindre du vet hva du gjør

🆘 Få hjelp
Vanlige problemer
"Jeg commitet ved et uhell til main"
bash# Opprett en branch fra dine commits
git checkout -b feature/mine-endringer
git checkout main
git reset --hard origin/main
"Min branch er bak main"
bashgit checkout main
git pull origin main
git checkout din-branch
git merge main
"Jeg har merge konflikter"

Git vil markere konfliktfiler
Åpne filer og se etter <<<<<<<, =======, >>>>>>> markører
Velg hvilken kode du vil beholde
Fjern konfliktmarkørene
git add . og git commit

Komme seg ut av problemer
Hvis du noen gang er forvirret eller står fast:

Kjør git status for å se hva som skjer
Spør en teamkamerat om hjelp
Sjekk denne guiden
Når i tvil, lag en backup av arbeidet ditt før du prøver rettelser

🎯 Hurtigreferanse
OppgaveKommandoHent siste kodegit pull origin mainOpprett feature branchgit checkout -b feature/navnLagre endringergit add . && git commit -m "melding"Del branchgit push origin branch-navnBytt branchesgit checkout branch-navnSe statusgit statusSe historikkgit log --oneline

💡 Profftips

Commit tidlig og ofte - små commits er lettere å gjennomgå og debugge
Skriv commit meldinger som om du fullfører setningen: "Denne commit vil..."
Bruk git status ofte for å holde oversikten
Når du samarbeider, kommuniser om hvem som jobber med hva
Sett opp editoren din til å vise Git informasjon (de fleste editorer har Git plugins)

Husk: Git kan virke overveldende først, men disse grunnleggende kommandoene håndterer 90% av ditt daglige arbeid. Fokuser på å mestre den grunnleggende arbeidsflyten før du utforsker avanserte funksjoner.
Lykke til med kodingen! 🚀