# Kollokvie.no

**AI-drevet plattform som strukturerer, effektiviserer og fasiliterer kollokviegrupper.**

## 🎯 Hva vi løser

Kollokviegrupper har stort potensial, men sliter ofte med:
- **Organisering**: Uklart hvem som gjør hva og når
- **Struktur**: Møter blir uformelle, ustrukturerte, ineffektive og uten tydelig agenda 
- **Kunnskapsdeling**: Notater og kunnskap forblir fragmentert og privat
- **Engasjement**: Ulik deltakelse og frafall

> Resultatet er at mye tid brukes uten at gruppen reelt bygger felles forståelse.

## 💡 Vår løsning
Kollokvie.no organiserer hele kollokviesyklusen med AI som fasilitator:
- **Delegasjonsfase**: Oppgaver og fokusområder fordeles slik at alle bidrar.
- **Forberedelsesfase**: Medlemmer laster opp notater, spørsmål og innsikter gjennom platformen.
- **Møtefase** AI genererer agenda, spørsmål og diskusjonsrunder, leder møter og sikrer struktur.
- **Etterarbeid**: Kunnskapsbank (masterdokument) oppdateres og arkiveres, sammendrag lages og neste møte planlegges.


## 🚀 Core features

- 📋 **Felles semesterplan** med oppgaver og individuelle gjøremål / fokusområder
- 🤖 **AI-spørsmålsgenerator** basert på pensum og notater
- 📚 **Masterdokument / kunnskapsbase** som samler gruppens kollektive kunnskap og innsikt
- 🔄 **Roterende lederrolle** for demokratisk arbeidsfordeling
- 📊 **Progresjonsoversikt** som viser kunnskapshull og styrker
- 💬 **Møtesammendrag** som identifiserer neste steg

## Verdien for brukerne

**Effektivitet**: Tiden i møtene brukes på diskusjon og læring – ikke organisering.

**Kollektiv læring**: AI samler individuelle bidrag til en felles kunnskapsbase som alle lærer av.

**Engasjement**: Strukturerte roller og oppgaver sikrer at alle deltar aktivt.

**Resultater**: Bedre faglig utbytte, sterkere repetisjon, og en levende masterdokumentasjon som støtter eksamensforberedelser.

**Kort fortalt:** 
Kollokvie.no gjør kollokviegrupper til en syklisk, AI-støttet læringsprosess som gir struktur, engasjement og målbare resultater – langt utover tradisjonelle, uformelle kollokviemøter.

---

## 🚀 Kom i gang (utviklere)

### Første gangs oppsett
```bash
# Sett opp din identitet (kjør én gang)
git config --global user.name "Ditt Fulle Navn"
git config --global user.email "din.epost@firma.no"

# Hent prosjektet
git clone <repository-url>
cd kollokvie.no
```

## 📋 Daglig arbeidsflyt

### 1. Start alltid med å sjekke tilstanden
```bash
# Se hvilke filer som har endret seg
git status

# Se detaljerte endringer
git diff
```

### 2. Hent siste endringer
```bash
git checkout main
git pull origin main
```

### 3. Opprett ny branch for ditt arbeid
```bash
git checkout -b feature/din-funksjon
```

### 4. Gjør endringer og commit
```bash
# Legg til endringer
git add .

# Commit med beskrivende melding
git commit -m "Legg til brukerautentisering"

# Push til remote
git push origin feature/din-funksjon
```

### 5. Opprett Pull Request
- Gå til GitHub
- Klikk "New Pull Request"
- Velg din branch → main
- Be om review

## 🌿 Branch-navngivning

- `feature/bruker-login` - for nye funksjoner
- `bugfix/header-styling` - for feilrettinger  
- `hotfix/sikkerhet` - for kritiske rettelser

## ⚠️ Viktige regler

### ✅ Gjør dette
- Pull før du starter nytt arbeid
- Bruk beskrivende commit-meldinger
- Test endringene dine før commit
- Bruk Pull Requests for code review
- Hold branches oppdatert med main

### ❌ Ikke gjør dette
- Commit direkte til main
- Push ødelagt kode
- Bruk vage commit-meldinger som "fixes"
- Jobb på flere funksjoner i samme branch

## 🔧 Nyttige kommandoer

```bash
# Se commit-historikk
git log --oneline

# Bytt branch
git checkout branch-navn

# Se alle branches
git branch

# Slett branch (etter merge)
git branch -d feature/gammel-funksjon

# Angre siste commit (behold endringer)
git reset --soft HEAD~1
```

## 🆘 Hjelp

Hvis du står fast:
1. Kjør `git status` for å se hva som skjer
2. Spør en teamkollega
3. Ved merge-konflikter: åpne filen, fjern `<<<<<<<`, `=======`, `>>>>>>>` markørene
4. `git add .` og `git commit` etter å ha løst konflikter

---

*Happy coding! 🚀*
