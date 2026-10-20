<div align="center">

# RE-Tool

### Reverse engineering locale per agenti AI e terminale

**Analizza binari, applicazioni e comportamento a runtime con un'unica CLI e un unico server MCP.**

[![MCP tool catalog](https://img.shields.io/badge/MCP-tool_catalog-5c4ee5?style=flat-square)](docs/mcp-contracts.md#generated-catalog)
[![MIT license](https://img.shields.io/badge/license-MIT-f4c430?style=flat-square)](LICENSE)

<code>re-tool --help</code>

</div>

> [!NOTE]
> RE-Tool è una versione personalizzata di **[REA (Reverse Engineer Anything)](https://github.com/morluto/rea)**
> di morluto, distribuita con licenza MIT. Questo repository **non** è il progetto
> ufficiale REA: per la versione ufficiale fai riferimento a
> [morluto/rea](https://github.com/morluto/rea).
>
> Internamente il motore conserva il nome REA (messaggi, variabili d'ambiente
> `REA_*`, bridge per Ghidra/Hopper/IDA) per restare compatibile con il codice
> originale.

---

RE-Tool collega il tuo agente (Claude Code, Codex, Cursor, Gemini CLI e
[altri](docs/installation.md#supported-agents)) a strumenti per ispezionare
binari nativi, app JavaScript/Electron, assembly .NET, APK Android, siti web e
molto altro. L'analisi avviene in locale e ogni risultato riporta le evidenze e
i limiti su cui si basa.

## Requisiti

- **Node.js** 22.x (>= 22.19), 24.x (>= 24.11) oppure 26+, con **npm**
- **git**
- Su Linux: un `ps` compatibile con procps nel `PATH`
- Facoltativi, a seconda di cosa vuoi analizzare: Ghidra, Hopper o IDA per i
  binari nativi; JADX e un JDK per Android; un browser Chrome/Chromium per i
  siti web. Vedi la [tabella delle analisi](#cosa-puoi-analizzare).

## Avvio rapido

### 1. Installa

Il modo più semplice è installare il pacchetto pubblicato nelle
[Release](https://github.com/w8997wnwy5-collab/reverse_engineering/releases), senza clonare né compilare:

```bash
npm install --global https://github.com/w8997wnwy5-collab/reverse_engineering/releases/download/re-tool-6.7.0/re-tool-6.7.0.tgz
re-tool --help
```

Per una versione più recente, copia il link del file `.tgz` dalla Release più
nuova.

In alternativa compila dai sorgenti:

```bash
git clone https://github.com/w8997wnwy5-collab/reverse_engineering.git
cd reverse_engineering
npm ci
npm run build
```

### 2. Prova la CLI

Da una copia compilata dei sorgenti puoi provarla senza installarla:

```bash
node scripts/rea.mjs --help
node scripts/rea.mjs doctor
```

Per avere il comando `re-tool` disponibile ovunque da quella copia:

```bash
npm install --global .
re-tool --help
```

Esempio: analizza un'app JavaScript/Electron estratta (o un file ASAR):

```bash
re-tool analyze-javascript-application /percorso/assoluto/app --json
```

### 3. Collega il tuo agente (MCP)

Con il comando `re-tool` installato globalmente:

```bash
re-tool setup
```

Scegli gli agenti, controlla le modifiche proposte e approvale. Setup registra
il server MCP e installa le istruzioni di lavoro per l'agente, con un backup
della configurazione esistente. Poi riavvia l'agente.

In alternativa puoi registrare il server a mano (vedi anche
[registrazione MCP manuale](docs/installation.md#mcp-registry)). Con il comando
`re-tool` installato globalmente, per Claude Code:

```bash
claude mcp add --scope local re-tool -- re-tool mcp
```

Per i client che usano un file JSON:

```json
{
  "mcpServers": {
    "re-tool": {
      "command": "re-tool",
      "args": ["mcp"]
    }
  }
}
```

Da una copia dei sorgenti non installata usa invece `node` con il percorso
assoluto dello script, ad esempio
`claude mcp add --scope local re-tool -- node /percorso/assoluto/reverse_engineering/scripts/rea.mjs mcp`.

### 4. Chiedi al tuo agente

```text
Analizza come funziona la ricerca nell'app Note, mostrami le evidenze e
costruisci una funzionalità simile per il mio progetto.
```

> [!WARNING]
> Il pacchetto `re-tool` **non è pubblicato su npm**. I comandi della
> documentazione che usano `npx re-tool@...` o `bunx re-tool@...` funzionano
> solo dopo che avrai pubblicato tu stesso il pacchetto. Fino ad allora usa
> la Release o l'installazione da sorgente descritte sopra.
>
> Per lo stesso motivo **non usare `re-tool update`** (né `re-tool --update`):
> cerca gli aggiornamenti sul registro npm, dove il nome `re-tool` non è tuo.
> Aggiorna come descritto qui sotto.

### Aggiornare

Se hai installato dalla Release, ripeti `npm install --global` con il link del
`.tgz` della [Release](https://github.com/w8997wnwy5-collab/reverse_engineering/releases) più recente.

Se hai compilato dai sorgenti:

```bash
git pull
npm ci
npm run build
```

e, se avevi installato il comando globalmente, ripeti `npm install --global .`.
In entrambi i casi poi riavvia l'agente.

### Pubblicare una nuova Release

Il workflow [GitHub release](.github/workflows/github-release.yml) compila il
pacchetto, lo prova e lo allega alla Release `re-tool-<versione>`, dove
`<versione>` è quella di `package.json`. Avvialo dalla scheda **Actions**
(_GitHub release_ → _Run workflow_ sul branch `main`) oppure pubblicando un tag
con quel nome.

Una Release esistente non viene mai sostituita con un commit diverso: per
pubblicare nuove modifiche aumenta prima la versione.

```bash
npm version 6.8.0 --no-git-tag-version   # package.json e package-lock.json
npm run metadata:generate                # src/generatedPackageMetadata.ts
```

Aggiorna la stessa versione anche nei due campi `version` di `server.json` e
nei comandi di `docs/installation.md` racchiusi dai commenti
`x-release-please`, verifica con `npm run mcp-registry:check`, fai commit e
push su `main` e poi avvia il workflow.

## Cosa puoi analizzare

| Obiettivo                 | Cosa restituisce                                                  | Requisiti e guida                                                                        |
| ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Binari nativi             | Pseudocodice, assembly, stringhe, simboli, chiamate e riferimenti | Hopper, Ghidra o IDA; [analisi nativa](docs/native-investigation.md)                     |
| Binari Go e Rust          | Versione del compilatore, moduli e dipendenze incorporate         | Nessuno; [Go](docs/go-binaries.md), [Rust](docs/rust-binaries.md)                        |
| WASM                      | Sezioni, import/export e WAT decodificato                         | WABT 1.0.42; [guida WASM](docs/wasm-artifacts.md)                                        |
| Bytecode EVM              | Selettori, argomenti dedotti e mutabilità                         | Linux x64; [guida EVM](docs/evm-bytecode.md)                                             |
| Database SQLite           | Tabelle, colonne, indici, viste, trigger e righe                  | Node.js 24.15+ o 26+; [guida SQLite](docs/sqlite-databases.md)                           |
| JavaScript / Electron     | Moduli, import, source map, route, IPC e add-on nativi            | Node.js e npm; [applicazioni](docs/javascript-application-workflows.md)                  |
| Siti web                  | Struttura, script, traffico di rete e screenshot                  | Browser Chrome/Chromium; [browser](docs/browser-observation.md)                          |
| Catture di rete           | Richieste, risposte e payload (HAR, SAZ, pcap)                    | [catture web](docs/web-network-captures.md), [pcap](docs/pcap-analysis.md)               |
| Assembly .NET             | Metadati, istruzioni CIL e dipendenze native                      | Nessuno; [codice gestito](docs/managed-code-analysis.md)                                 |
| APK e dispositivi Android | Manifest, classi, metodi decompilati, log e pacchetti             | JADX + JDK, adb; [Android](docs/android-analysis.md), [ADB](docs/adb-device-analysis.md) |
| App Flutter               | Hash dello snapshot Dart e provenienza del motore                 | Nessuno; [Flutter](docs/flutter-analysis.md)                                             |
| Firmware                  | Regioni, estrazione e passaggio all'analisi nativa                | Binwalk / Unblob su Linux; [firmware](docs/firmware-analysis.md)                         |
| Crash registrati Linux    | Registri, segnali e thread                                        | pwntools; [crash registrati](docs/recorded-crashes.md)                                   |
| Processi                  | Output del terminale, interazioni e osservazioni del filesystem   | Linux/macOS; [cattura processi](docs/process-capture.md)                                 |

<a id="choosing-a-deep-analysis-provider"></a>

Per scegliere il motore di analisi nativa vedi la
[configurazione di Hopper e Ghidra](docs/installation.md#hopper), la
[guida IDA](docs/ida-provider.md) e la [scelta del provider nella CLI](docs/cli.md#choose-a-provider).
L'elenco completo di strumenti, provider e comandi è nel
[catalogo generato](docs/mcp-contracts.md#generated-catalog); le altre guide
sono nella cartella [`docs/`](docs/).

## Come funziona

L'agente chiama RE-Tool tramite MCP per ispezionare l'obiettivo e seguire il
codice rilevante. RE-Tool restituisce i risultati con le relative evidenze;
l'agente li usa per fare altre domande, spiegare il comportamento o scrivere e
testare un'implementazione. I comandi della CLI usano gli stessi flussi.

## Struttura del repository

| Percorso                  | Contenuto                                                      |
| ------------------------- | -------------------------------------------------------------- |
| `src/`                    | Codice TypeScript: dominio, provider, CLI e server MCP         |
| `bridge/`                 | Script ponte per Ghidra, Hopper, Cutter, JADX, LLDB, mitmproxy |
| `scripts/`                | Entry point `scripts/rea.mjs`, build, generatori e verifiche   |
| `tests/`                  | Test di dominio, conformità, boundary e accettazione (Vitest)  |
| `docs/`                   | Guide d'uso e contratti MCP                                    |
| `.agents/skills/`         | Istruzioni per gli agenti installate da `re-tool setup`        |
| `native/`, `third_party/` | Componenti nativi Windows e dipendenze esterne (submodule git) |
| `website/`                | Sito originale di REA, conservato come riferimento per i test  |

## Sviluppo

```bash
npm ci
npm run build          # compila in dist/
npm run typecheck      # controllo dei tipi TypeScript
npm run lint           # lint
npx vitest run --project domain --project services   # test veloci
```

La suite completa è molto ampia; vedi [docs/testing.md](docs/testing.md) e
[CONTRIBUTING.md](CONTRIBUTING.md) per i gruppi di test e i controlli.

## Differenze rispetto a REA

- Nome del pacchetto, del comando e del server MCP: `re-tool` (invece di
  `rea-agents` / `rea`), così può convivere con un'installazione ufficiale di REA.
- Metadati, link e registro MCP puntano a questo repository.
- README in italiano; rimossi i README tradotti del progetto originale.
- GitHub Actions: rimosse le esecuzioni pianificate (cron) e il rilascio
  automatico su npm a ogni push. I workflow restano avviabili a mano dalla
  scheda _Actions_; la CI normale gira sulle pull request verso `main`.
- Distribuzione tramite Release GitHub (pacchetto `.tgz` installabile con npm)
  invece del registro npm.
- La cartella `website/` (sito originale di REA) è conservata solo come
  riferimento: i test usano le sue app di esempio.

## Uso responsabile

RE-Tool è pensato per ricerca legale, didattica, interoperabilità,
conservazione del software e analisi di software che possiedi o che sei
autorizzato a esaminare. Vedi [DISCLAIMER.md](DISCLAIMER.md).

**Gli strumenti commerciali** (IDA Pro / Hex-Rays, Hopper, JEB) vanno ottenuti
legalmente e usati secondo le rispettive licenze: RE-Tool non fornisce licenze
né chiavi di attivazione.

## Licenza

[MIT](LICENSE): Copyright (c) 2026 w8997wnwy5-collab per le modifiche e
Copyright (c) 2026 morluto per il progetto originale REA. Il materiale di terze
parti mantiene le proprie licenze; vedi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
