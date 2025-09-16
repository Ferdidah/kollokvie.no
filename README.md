Kollokvie.no


## 🚀 Kom i gang

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