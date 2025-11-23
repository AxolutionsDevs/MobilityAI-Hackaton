import { Category, MetroLine } from "@/types";
import {
  Clock,
  MessageSquare,
  Shield,
  Sparkles,
  Train,
  Users,
  Wrench,
} from "lucide-react";
import {
  LINE_COMPLAINT_DATA,
  STATION_COMPLAINT_DATA,
} from "./data/processComplaints";
import { VIENNA_METRO_LINES } from "./data/viennaMetroLines";

// ========== DATOS FAKE VIENNA - CAJA NEGRA ==========
// 90 ESTACIONES COMPLETAS con datos simulados variados
const VIENNA_FAKE_DATA: Record<string, any> = {
  Schweglerstraße: {
    reportCount: 42,
    severity: 0.38,
    recentIssue: "Alles in Ordnung",
    lastReportDate: "2025-01-22",
    complaintIndex: 38,
    topKeywords: ["sauber", "pünktlich", "gut"],
    recentComments: [],
  },
  Erdberg: {
    reportCount: 58,
    severity: 0.55,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-26",
    complaintIndex: 55,
    topKeywords: ["verspätung", "warten", "kalt"],
    recentComments: [],
  },
  Siebenhirten: {
    reportCount: 36,
    severity: 0.32,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-21",
    complaintIndex: 32,
    topKeywords: ["ruhig", "sauber", "ordnung"],
    recentComments: [],
  },
  Vorgartenstraße: {
    reportCount: 48,
    severity: 0.44,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-23",
    complaintIndex: 44,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Braunschweiggasse: {
    reportCount: 52,
    severity: 0.48,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 48,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  Donauinsel: {
    reportCount: 29,
    severity: 0.25,
    recentIssue: "Alles gut",
    lastReportDate: "2025-01-20",
    complaintIndex: 25,
    topKeywords: ["schön", "natur", "entspannt"],
    recentComments: [],
  },
  Donauspilal: {
    reportCount: 45,
    severity: 0.41,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-24",
    complaintIndex: 41,
    topKeywords: ["verspätung", "information", "warten"],
    recentComments: [],
  },
  "Alser Straße": {
    reportCount: 64,
    severity: 0.6,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 60,
    topKeywords: ["schmutz", "geruch", "reinigung"],
    recentComments: [],
  },
  "Simmering (": {
    reportCount: 61,
    severity: 0.58,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 58,
    topKeywords: ["schmutz", "geruch", "reinigung"],
    recentComments: [],
  },
  "Südtiroler Platz": {
    reportCount: 78,
    severity: 0.72,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-27",
    complaintIndex: 72,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  "Kettenbrucken-": {
    reportCount: 55,
    severity: 0.51,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 51,
    topKeywords: ["lärm", "störung", "bauarbeit"],
    recentComments: [],
  },
  Johnstraße: {
    reportCount: 39,
    severity: 0.35,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-22",
    complaintIndex: 35,
    topKeywords: ["ordnung", "sauber", "ruhig"],
    recentComments: [],
  },
  "Währinger Straße": {
    reportCount: 70,
    severity: 0.65,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 65,
    topKeywords: ["verspätung", "überfüllt", "warten"],
    recentComments: [],
  },
  "Aderklaaer Stralse": {
    reportCount: 34,
    severity: 0.31,
    recentIssue: "Alles gut",
    lastReportDate: "2025-01-21",
    complaintIndex: 31,
    topKeywords: ["ruhig", "sauber", "pünktlich"],
    recentComments: [],
  },
  Schottenring: {
    reportCount: 95,
    severity: 0.85,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 85,
    topKeywords: ["verspätung", "überfüllt", "information"],
    recentComments: [],
  },
  "Erlaaer Straße": {
    reportCount: 41,
    severity: 0.37,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-23",
    complaintIndex: 37,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Reumannplatz: {
    reportCount: 93,
    severity: 0.83,
    recentIssue: "Belästigung",
    lastReportDate: "2025-01-28",
    complaintIndex: 83,
    topKeywords: ["belästigung", "unsicher", "laut"],
    recentComments: [
      {
        date: "2025-01-28",
        category: "Belästigung",
        content: "Betrunkene Personen",
      },
    ],
  },
  Hütteldorf: {
    reportCount: 50,
    severity: 0.46,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-24",
    complaintIndex: 46,
    topKeywords: ["verspätung", "information", "warten"],
    recentComments: [],
  },
  Kricau: {
    reportCount: 28,
    severity: 0.24,
    recentIssue: "Keine Beschwerden",
    lastReportDate: "2025-01-20",
    complaintIndex: 24,
    topKeywords: ["ordentlich", "sauber", "gut"],
    recentComments: [],
  },
  "Hütteldorfer Straße": {
    reportCount: 57,
    severity: 0.53,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 53,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  Niederhofstrale: {
    reportCount: 37,
    severity: 0.33,
    recentIssue: "Alles in Ordnung",
    lastReportDate: "2025-01-22",
    complaintIndex: 33,
    topKeywords: ["ruhig", "sauber", "ordnung"],
    recentComments: [],
  },
  "Loopoldau ß": {
    reportCount: 32,
    severity: 0.29,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-21",
    complaintIndex: 29,
    topKeywords: ["ordnung", "sauber", "pünktlich"],
    recentComments: [],
  },
  Taubstummengasse: {
    reportCount: 66,
    severity: 0.61,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 61,
    topKeywords: ["schmutz", "geruch", "müll"],
    recentComments: [],
  },
  Zippererstrale: {
    reportCount: 43,
    severity: 0.39,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-23",
    complaintIndex: 39,
    topKeywords: ["verspätung", "information", "anzeige"],
    recentComments: [],
  },
  "Westbahnhof (": {
    reportCount: 145,
    severity: 0.94,
    recentIssue: "Diebstahl häufig",
    lastReportDate: "2025-01-29",
    complaintIndex: 94,
    topKeywords: ["diebstahl", "gefährlich", "überfüllt"],
    recentComments: [
      {
        date: "2025-01-29",
        category: "Diebstahl",
        content: "Rucksack gestohlen",
      },
      {
        date: "2025-01-28",
        category: "Belästigung",
        content: "Aggressive Bettler",
      },
    ],
  },
  "U4 OHeiligenstadt (": {
    reportCount: 71,
    severity: 0.66,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 66,
    topKeywords: ["verspätung", "überfüllt", "warten"],
    recentComments: [],
  },
  Praterstern: {
    reportCount: 120,
    severity: 0.98,
    recentIssue: "Diebstahl gemeldet",
    lastReportDate: "2025-01-28",
    complaintIndex: 98,
    topKeywords: ["diebstahl", "unsauber", "laut"],
    recentComments: [
      {
        date: "2025-01-28",
        category: "Diebstahl",
        content: "Brieftasche gestohlen",
      },
    ],
  },
  Donaumarina: {
    reportCount: 30,
    severity: 0.27,
    recentIssue: "Alles gut",
    lastReportDate: "2025-01-21",
    complaintIndex: 27,
    topKeywords: ["schön", "ruhig", "sauber"],
    recentComments: [],
  },
  Aspernstraße: {
    reportCount: 62,
    severity: 0.59,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 59,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Schönbrunn: {
    reportCount: 85,
    severity: 0.79,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 79,
    topKeywords: ["überfüllt", "touristen", "gedränge"],
    recentComments: [],
  },
  Keplerplatz: {
    reportCount: 53,
    severity: 0.49,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 49,
    topKeywords: ["lärm", "störung", "bauarbeit"],
    recentComments: [],
  },
  Hietzing: {
    reportCount: 72,
    severity: 0.67,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 67,
    topKeywords: ["verspätung", "warten", "information"],
    recentComments: [],
  },
  Tscherttegasse: {
    reportCount: 46,
    severity: 0.42,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-24",
    complaintIndex: 42,
    topKeywords: ["schmutz", "müll", "ordnung"],
    recentComments: [],
  },
  "Kagraner Platz": {
    reportCount: 59,
    severity: 0.56,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-26",
    complaintIndex: 56,
    topKeywords: ["verspätung", "warten", "kalt"],
    recentComments: [],
  },
  Großsfcldsicdlung: {
    reportCount: 35,
    severity: 0.32,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-22",
    complaintIndex: 32,
    topKeywords: ["ruhig", "ordnung", "sauber"],
    recentComments: [],
  },
  Alterlaa: {
    reportCount: 40,
    severity: 0.36,
    recentIssue: "Alles in Ordnung",
    lastReportDate: "2025-01-23",
    complaintIndex: 36,
    topKeywords: ["ordnung", "sauber", "pünktlich"],
    recentComments: [],
  },
  "Nußdorler Slraße": {
    reportCount: 51,
    severity: 0.47,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 47,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  "Messe-Prater": {
    reportCount: 76,
    severity: 0.71,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-27",
    complaintIndex: 71,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Gasometer: {
    reportCount: 69,
    severity: 0.64,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 64,
    topKeywords: ["schmutz", "geruch", "reinigung"],
    recentComments: [],
  },
  Zieglergasse: {
    reportCount: 74,
    severity: 0.69,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 69,
    topKeywords: ["verspätung", "überfüllt", "warten"],
    recentComments: [],
  },
  Donaustadtbrucke: {
    reportCount: 38,
    severity: 0.34,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-22",
    complaintIndex: 34,
    topKeywords: ["ordnung", "sauber", "pünktlich"],
    recentComments: [],
  },
  Schwedenplatz: {
    reportCount: 88,
    severity: 0.78,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-26",
    complaintIndex: 78,
    topKeywords: ["lärm", "musik", "bettler"],
    recentComments: [],
  },
  Schlachthausgasse: {
    reportCount: 56,
    severity: 0.52,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-25",
    complaintIndex: 52,
    topKeywords: ["schmutz", "geruch", "müll"],
    recentComments: [],
  },
  Rennbahnweg: {
    reportCount: 44,
    severity: 0.4,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-23",
    complaintIndex: 40,
    topKeywords: ["verspätung", "information", "anzeige"],
    recentComments: [],
  },
  "Museums-": {
    reportCount: 91,
    severity: 0.81,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 81,
    topKeywords: ["überfüllt", "touristen", "gedränge"],
    recentComments: [],
  },
  Rochusgasse: {
    reportCount: 49,
    severity: 0.45,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-24",
    complaintIndex: 45,
    topKeywords: ["lärm", "störung", "bauarbeit"],
    recentComments: [],
  },
  "Alte Donau": {
    reportCount: 31,
    severity: 0.28,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-21",
    complaintIndex: 28,
    topKeywords: ["ruhig", "sauber", "angenehm"],
    recentComments: [],
  },
  Margaretengürtel: {
    reportCount: 63,
    severity: 0.6,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 60,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Hardeggasse: {
    reportCount: 47,
    severity: 0.43,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-24",
    complaintIndex: 43,
    topKeywords: ["verspätung", "information", "warten"],
    recentComments: [],
  },
  Burggasse: {
    reportCount: 67,
    severity: 0.62,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-26",
    complaintIndex: 62,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  "Stephans -": {
    reportCount: 110,
    severity: 0.92,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-29",
    complaintIndex: 92,
    topKeywords: ["überfüllt", "hitze", "gedränge"],
    recentComments: [
      {
        date: "2025-01-29",
        category: "Überfüllung",
        content: "Zu viele Leute, kein Platz",
      },
    ],
  },
  "Unter=": {
    reportCount: 73,
    severity: 0.68,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 68,
    topKeywords: ["verspätung", "überfüllt", "warten"],
    recentComments: [],
  },
  Schöptwerk: {
    reportCount: 25,
    severity: 0.2,
    recentIssue: "Keine Beschwerden",
    lastReportDate: "2025-01-19",
    complaintIndex: 20,
    topKeywords: ["ordentlich", "sauber", "gut"],
    recentComments: [],
  },
  Schotlentor: {
    reportCount: 98,
    severity: 0.86,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 86,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Stadion: {
    reportCount: 107,
    severity: 0.89,
    recentIssue: "Überfüllung bei Events",
    lastReportDate: "2025-01-28",
    complaintIndex: 89,
    topKeywords: ["überfüllt", "fans", "gedränge"],
    recentComments: [
      {
        date: "2025-01-28",
        category: "Überfüllung",
        content: "Nach Fußballspiel chaotisch",
      },
    ],
  },
  Michelbeuern: {
    reportCount: 54,
    severity: 0.5,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-25",
    complaintIndex: 50,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Enkplatz: {
    reportCount: 60,
    severity: 0.57,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-26",
    complaintIndex: 57,
    topKeywords: ["verspätung", "warten", "kalt"],
    recentComments: [],
  },
  "Spittelau $": {
    reportCount: 67,
    severity: 0.62,
    recentIssue: "Ausfall Aufzug",
    lastReportDate: "2025-01-25",
    complaintIndex: 62,
    topKeywords: ["aufzug", "barriere", "defekt"],
    recentComments: [],
  },
  Thaliastraße: {
    reportCount: 71,
    severity: 0.66,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-27",
    complaintIndex: 66,
    topKeywords: ["lärm", "störung", "bauarbeit"],
    recentComments: [],
  },
  Längenfeldgasse: {
    reportCount: 54,
    severity: 0.5,
    recentIssue: "Beleuchtung",
    lastReportDate: "2025-01-24",
    complaintIndex: 50,
    topKeywords: ["dunkel", "beleuchtung", "sicherheit"],
    recentComments: [],
  },
  Neubaugasse: {
    reportCount: 80,
    severity: 0.74,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-27",
    complaintIndex: 74,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Philadelphiabrücke: {
    reportCount: 42,
    severity: 0.38,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-23",
    complaintIndex: 38,
    topKeywords: ["verspätung", "information", "warten"],
    recentComments: [],
  },
  Herrengasse: {
    reportCount: 82,
    severity: 0.76,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-27",
    complaintIndex: 76,
    topKeywords: ["überfüllt", "gedränge", "touristen"],
    recentComments: [],
  },
  Straße: {
    reportCount: 48,
    severity: 0.44,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-24",
    complaintIndex: 44,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Kaisermühlen: {
    reportCount: 52,
    severity: 0.48,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 48,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  Kagran: {
    reportCount: 65,
    severity: 0.61,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-26",
    complaintIndex: 61,
    topKeywords: ["verspätung", "überfüllt", "warten"],
    recentComments: [],
  },
  Ottakring: {
    reportCount: 77,
    severity: 0.72,
    recentIssue: "Belästigung",
    lastReportDate: "2025-01-27",
    complaintIndex: 72,
    topKeywords: ["belästigung", "unsicher", "laut"],
    recentComments: [],
  },
  Nestroyplatz: {
    reportCount: 58,
    severity: 0.55,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 55,
    topKeywords: ["schmutz", "geruch", "müll"],
    recentComments: [],
  },
  "Neue Donau": {
    reportCount: 33,
    severity: 0.3,
    recentIssue: "Alles in Ordnung",
    lastReportDate: "2025-01-21",
    complaintIndex: 30,
    topKeywords: ["ruhig", "sauber", "entspannt"],
    recentComments: [],
  },
  "Roßauer Lfnde": {
    reportCount: 56,
    severity: 0.52,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-25",
    complaintIndex: 52,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  Dresdner: {
    reportCount: 45,
    severity: 0.41,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-24",
    complaintIndex: 41,
    topKeywords: ["verspätung", "information", "warten"],
    recentComments: [],
  },
  Stadtpark: {
    reportCount: 84,
    severity: 0.78,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 78,
    topKeywords: ["überfüllt", "touristen", "gedränge"],
    recentComments: [],
  },
  Friedensbrücke: {
    reportCount: 61,
    severity: 0.58,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 58,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  platz: {
    reportCount: 50,
    severity: 0.46,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-24",
    complaintIndex: 46,
    topKeywords: ["lärm", "störung", "bauarbeit"],
    recentComments: [],
  },
  Jägerstraße: {
    reportCount: 43,
    severity: 0.39,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-23",
    complaintIndex: 39,
    topKeywords: ["verspätung", "information", "anzeige"],
    recentComments: [],
  },
  Perfektastrale: {
    reportCount: 36,
    severity: 0.33,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-22",
    complaintIndex: 33,
    topKeywords: ["ordnung", "sauber", "ruhig"],
    recentComments: [],
  },
  Taborstraße: {
    reportCount: 68,
    severity: 0.63,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-26",
    complaintIndex: 63,
    topKeywords: ["schmutz", "geruch", "reinigung"],
    recentComments: [],
  },
  Landstraße: {
    reportCount: 102,
    severity: 0.87,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-28",
    complaintIndex: 87,
    topKeywords: ["schmutz", "geruch", "müll"],
    recentComments: [
      {
        date: "2025-01-28",
        category: "Schmutz",
        content: "Bahnsteig sehr schmutzig",
      },
    ],
  },
  Volkstheater: {
    reportCount: 75,
    severity: 0.7,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-27",
    complaintIndex: 70,
    topKeywords: ["verspätung", "information", "anzeige"],
    recentComments: [],
  },
  Stubentor: {
    reportCount: 79,
    severity: 0.73,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-27",
    complaintIndex: 73,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Handelskai: {
    reportCount: 55,
    severity: 0.51,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-25",
    complaintIndex: 51,
    topKeywords: ["verspätung", "warten", "information"],
    recentComments: [],
  },
  "Kardinal-Nagl-Platz": {
    reportCount: 41,
    severity: 0.37,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-23",
    complaintIndex: 37,
    topKeywords: ["schmutz", "müll", "reinigung"],
    recentComments: [],
  },
  Gurnpendorler: {
    reportCount: 68,
    severity: 0.63,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-26",
    complaintIndex: 63,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Rathaus: {
    reportCount: 96,
    severity: 0.84,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 84,
    topKeywords: ["überfüllt", "touristen", "gedränge"],
    recentComments: [],
  },
  "Floridsdorf (": {
    reportCount: 64,
    severity: 0.6,
    recentIssue: "Verspätung",
    lastReportDate: "2025-01-26",
    complaintIndex: 60,
    topKeywords: ["verspätung", "warten", "kalt"],
    recentComments: [],
  },
  Kendlerslraße: {
    reportCount: 38,
    severity: 0.34,
    recentIssue: "Keine Probleme",
    lastReportDate: "2025-01-22",
    complaintIndex: 34,
    topKeywords: ["ordnung", "sauber", "pünktlich"],
    recentComments: [],
  },
  Sladlau: {
    reportCount: 47,
    severity: 0.43,
    recentIssue: "Schmutz",
    lastReportDate: "2025-01-24",
    complaintIndex: 43,
    topKeywords: ["schmutz", "müll", "ordnung"],
    recentComments: [],
  },
  "Josefstädter Straße": {
    reportCount: 72,
    severity: 0.67,
    recentIssue: "Lärm",
    lastReportDate: "2025-01-27",
    complaintIndex: 67,
    topKeywords: ["lärm", "bauarbeit", "störung"],
    recentComments: [],
  },
  quartier: {
    reportCount: 89,
    severity: 0.8,
    recentIssue: "Überfüllung",
    lastReportDate: "2025-01-28",
    complaintIndex: 80,
    topKeywords: ["überfüllt", "gedränge", "hitze"],
    recentComments: [],
  },
  Veit: {
    reportCount: 35,
    severity: 0.32,
    recentIssue: "Alles in Ordnung",
    lastReportDate: "2025-01-22",
    complaintIndex: 32,
    topKeywords: ["ruhig", "ordnung", "sauber"],
    recentComments: [],
  },
};

export const CATEGORIES: Category[] = [
  {
    id: "seguridad",
    name: "Security",
    icon: Shield,
    weight: 0.3,
    color: "#ef4444",
  },
  {
    id: "puntualidad",
    name: "Punctuality",
    icon: Clock,
    weight: 0.25,
    color: "#f59e0b",
  },
  {
    id: "limpieza",
    name: "Cleanliness",
    icon: Sparkles,
    weight: 0.15,
    color: "#10b981",
  },
  {
    id: "comodidad",
    name: "Comfort",
    icon: Users,
    weight: 0.1,
    color: "#6366f1",
  },
  {
    id: "comunicacion",
    name: "Communication",
    icon: MessageSquare,
    weight: 0.1,
    color: "#8b5cf6",
  },
  {
    id: "fallas",
    name: "Technical Failures",
    icon: Wrench,
    weight: 0.05,
    color: "#06b6d4",
  },
  {
    id: "saturacion",
    name: "Saturation",
    icon: Train,
    weight: 0.05,
    color: "#ec4899",
  },
];

export const METRO_LINES: MetroLine[] = [];

/**
 * Obtiene las líneas de metro según la ciudad
 */
export function getMetroLines(city: "cdmx" | "vienna"): MetroLine[] {
  const lines = city === "cdmx" ? METRO_LINES : VIENNA_METRO_LINES;
  console.log(`[getMetroLines] City: ${city}, Lines:`, lines.length);
  return lines;
}

// Datos reales de reportes de quejas por estación desde complaints_cdmx.json
// severity: 0.0 = sin gravedad (sin rojo), 1.0 = gravedad máxima (rojo intenso)
// complaintIndex: porcentaje (0-100%) que representa el índice de quejas
// topKeywords: palabras más frecuentes en los comentarios de la estación
// recentComments: últimos 5 comentarios de la estación
export const STATION_REPORT_DATA: Record<
  string,
  {
    reportCount: number;
    severity: number;
    recentIssue: string;
    lastReportDate: string;
    complaintIndex: number;
    topKeywords: string[];
    recentComments: Array<{
      content: string;
      date: string;
      subject: string;
    }>;
  }
> = STATION_COMPLAINT_DATA;

// ========== DATOS MOCK PARA VIENNA ==========
// Usando datos hard-coded en lugar de procesamiento complejo
export const STATION_REPORT_DATA_VIENNA = VIENNA_FAKE_DATA;

// Datos de comentarios por línea
export const LINE_REPORT_DATA: Record<
  string,
  {
    lineName: string;
    recentComments: Array<{
      station: string;
      content: string;
      date: string;
      subject: string;
    }>;
  }
> = LINE_COMPLAINT_DATA;

// Datos de comentarios por línea Vienna (MOCK)
export const LINE_REPORT_DATA_VIENNA: Record<
  string,
  {
    lineName: string;
    recentComments: Array<{
      station: string;
      content: string;
      date: string;
      subject: string;
    }>;
  }
> = {}; // Vacío por ahora, solo usamos datos de estaciones

export const PALABRAS_CLAVE: Record<string, string[]> = {
  seguridad: [
    "ROBOS",
    "ASALTOS",
    "ACOSO",
    "INSEGURO",
    "MIEDO",
    "PELEAS",
    "DROGAS",
    "VENDEDORES",
    "MANOSEO",
    "CARTERISTAS",
  ],
  puntualidad: [
    "RETRASOS",
    "TARDANZA",
    "LENTO",
    "ESPERA",
    "DEMORA",
    "TIEMPO",
    "HORARIO",
    "IMPUNTUAL",
    "FALTA",
    "TREN",
  ],
  limpieza: [
    "SUCIO",
    "BASURA",
    "OLOR",
    "ASQUEROSO",
    "COCHINO",
    "INMUNDO",
    "MUGRE",
    "DESASTRE",
    "PESTILENTE",
    "HIGIÉNICO",
  ],
  comodidad: [
    "LLENO",
    "CALOR",
    "ASIENTOS",
    "APRETADO",
    "SOFOCANTE",
    "INCÓMODO",
    "ASFIXIA",
    "EMPUJONES",
    "ESTRECHO",
    "HACINAMIENTO",
  ],
  comunicacion: [
    "CONFUSO",
    "AVISOS",
    "SEÑALES",
    "INFORMACIÓN",
    "ANUNCIOS",
    "MAPAS",
    "INDICACIONES",
    "DESORIENTADO",
    "PERDIDO",
    "INSTRUCCIONES",
  ],
  fallas: [
    "ESCALERAS",
    "AIRE",
    "PUERTAS",
    "ELEVADOR",
    "TORNIQUETES",
    "DESCOMPUESTO",
    "ROTO",
    "AVERÍA",
    "MANTENIMIENTO",
    "FALLA",
  ],
  saturacion: [
    "SATURADO",
    "ABARROTADO",
    "CAOS",
    "MULTITUD",
    "COLAPSO",
    "SOBRECUPO",
    "ATASCADO",
    "REPLETO",
    "DESBORDADO",
    "APRETUJADO",
  ],
};

// Palabras clave en alemán para Vienna
export const SCHLAGWORTE: Record<string, string[]> = {
  sicherheit: [
    "DIEBSTAHL",
    "ÜBERFALL",
    "BELÄSTIGUNG",
    "UNSICHER",
    "ANGST",
    "KÄMPFE",
    "DROGEN",
    "VERKÄUFER",
    "GRABSCHEN",
    "TASCHENDIEB",
  ],
  pünktlichkeit: [
    "VERSPÄTUNG",
    "VERZÖGERUNG",
    "LANGSAM",
    "WARTEN",
    "VERZUG",
    "ZEIT",
    "FAHRPLAN",
    "UNPÜNKTLICH",
    "FEHLT",
    "ZUG",
  ],
  sauberkeit: [
    "SCHMUTZIG",
    "MÜLL",
    "GERUCH",
    "EKELHAFT",
    "DRECKIG",
    "UNREIN",
    "SCHMUTZ",
    "KATASTROPHE",
    "STINKEND",
    "HYGIENISCH",
  ],
  komfort: [
    "VOLL",
    "HITZE",
    "SITZPLÄTZE",
    "ENG",
    "ERSTICKEND",
    "UNBEQUEM",
    "ERSTICKEN",
    "DRÄNGELN",
    "SCHMAL",
    "ÜBERFÜLLUNG",
  ],
  kommunikation: [
    "VERWIRREND",
    "ANSAGEN",
    "SCHILDER",
    "INFORMATION",
    "DURCHSAGEN",
    "KARTEN",
    "HINWEISE",
    "ORIENTIERUNGSLOS",
    "VERLOREN",
    "ANWEISUNGEN",
  ],
  störungen: [
    "ROLLTREPPEN",
    "LUFT",
    "TÜREN",
    "AUFZUG",
    "ENTWERTER",
    "KAPUTT",
    "DEFEKT",
    "STÖRUNG",
    "WARTUNG",
    "AUSFALL",
  ],
  überlastung: [
    "ÜBERLASTET",
    "ÜBERFÜLLT",
    "CHAOS",
    "MENSCHENMENGE",
    "KOLLAPS",
    "ÜBERLAST",
    "VERSTOPFT",
    "GEDRÄNGT",
    "ÜBERLAUFEN",
    "GEQUETSCHT",
  ],
};

export const FRASES_EJEMPLO: Record<string, string[]> = {
  ROBOS: ["Me robaron el celular", "Cuidado con los rateros", "Robo constante"],
  ASALTOS: [
    "Me asaltaron a punta de cuchillo",
    "Zona peligrosa",
    "Asaltos frecuentes",
  ],
  ACOSO: [
    "Me acosaron en el vagón",
    "Mucho acoso sexual",
    "Incomodidad constante",
  ],
  SUCIO: [
    "Está asqueroso el piso",
    "Huele muy mal",
    "Necesita limpieza urgente",
  ],
  BASURA: [
    "Mucha basura acumulada",
    "Tiran basura por todos lados",
    "Falta de botes",
  ],
  OLOR: [
    "Olor insoportable",
    "Apesta horrible",
    "Necesitan ventilación urgente",
  ],
  RETRASOS: [
    "Llevo 20 min esperando",
    "El tren no pasa",
    "Siempre con retrasos",
  ],
  TARDANZA: ["Muy tardado", "Demora excesiva", "Nunca es puntual"],
  LENTO: ["Servicio muy lento", "Va a vuelta de rueda", "Demasiado lento"],
  LLENO: ["Imposible subir", "Iba como sardina", "No cabe ni un alfiler"],
  CALOR: ["Calor insoportable", "Se siente como sauna", "Asfixiante el calor"],
  ASIENTOS: ["No hay asientos", "Todos los asientos rotos", "Faltan asientos"],
  ESCALERAS: [
    "Escaleras sin funcionar",
    "Otra vez descompuestas",
    "Siempre fuera de servicio",
  ],
  AIRE: ["No hay aire acondicionado", "Clima descompuesto", "Sin ventilación"],
  PUERTAS: ["Puertas trabadas", "No cierran bien", "Peligro con las puertas"],
  SATURADO: ["Demasiada gente", "Colapsó la estación", "Saturación extrema"],
  ABARROTADO: [
    "Está abarrotadísimo",
    "No se puede ni respirar",
    "Lleno a reventar",
  ],
  CAOS: ["Es un caos total", "Desorganización completa", "Mucho desorden"],
  CONFUSO: [
    "Muy confuso el mapa",
    "No entiendo las señales",
    "Desorientación total",
  ],
  AVISOS: [
    "No hay avisos claros",
    "Falta información",
    "Avisos incomprensibles",
  ],
  SEÑALES: ["Señalización deficiente", "Faltan señales", "Señales borrosas"],
};

// Frases de ejemplo en alemán para Vienna
export const BEISPIELSÄTZE: Record<string, string[]> = {
  DIEBSTAHL: [
    "Handy wurde gestohlen",
    "Vorsicht vor Taschendieben",
    "Häufige Diebstähle",
  ],
  ÜBERFALL: [
    "Wurde mit Messer überfallen",
    "Gefährliche Zone",
    "Häufige Überfälle",
  ],
  BELÄSTIGUNG: [
    "Wurde im Waggon belästigt",
    "Viel sexuelle Belästigung",
    "Ständige Belästigung",
  ],
  SCHMUTZIG: [
    "Boden ist ekelhaft",
    "Riecht sehr schlecht",
    "Dringend Reinigung nötig",
  ],
  MÜLL: [
    "Viel Müll angehäuft",
    "Überall wird Müll weggeworfen",
    "Fehlende Mülleimer",
  ],
  GERUCH: [
    "Unerträglicher Geruch",
    "Stinkt furchtbar",
    "Dringend Belüftung nötig",
  ],
  VERSPÄTUNG: [
    "Warte schon 20 Minuten",
    "Zug kommt nicht",
    "Immer Verspätungen",
  ],
  VERZÖGERUNG: ["Sehr verzögert", "Übermäßige Verzögerung", "Nie pünktlich"],
  LANGSAM: ["Service sehr langsam", "Fährt im Schneckentempo", "Zu langsam"],
  VOLL: ["Unmöglich einzusteigen", "War wie eine Sardine", "Keinen Platz mehr"],
  HITZE: [
    "Unerträgliche Hitze",
    "Fühlt sich wie Sauna an",
    "Erstickende Hitze",
  ],
  SITZPLÄTZE: ["Keine Sitzplätze", "Alle Sitze kaputt", "Sitzplätze fehlen"],
  ROLLTREPPEN: [
    "Rolltreppen funktionieren nicht",
    "Wieder kaputt",
    "Immer außer Betrieb",
  ],
  LUFT: ["Keine Klimaanlage", "Klima kaputt", "Keine Belüftung"],
  TÜREN: ["Türen klemmen", "Schließen nicht richtig", "Gefahr bei Türen"],
  ÜBERLASTET: ["Zu viele Leute", "Station kollabiert", "Extreme Überlastung"],
  ÜBERFÜLLT: ["Total überfüllt", "Kann nicht mal atmen", "Zum Bersten voll"],
  CHAOS: ["Totales Chaos", "Komplette Unordnung", "Viel Durcheinander"],
  VERWIRREND: [
    "Karte sehr verwirrend",
    "Verstehe Schilder nicht",
    "Totale Desorientierung",
  ],
  ANSAGEN: [
    "Keine klaren Ansagen",
    "Fehlende Information",
    "Unverständliche Ansagen",
  ],
  SCHILDER: [
    "Mangelhafte Beschilderung",
    "Schilder fehlen",
    "Verschwommene Schilder",
  ],
};

/**
 * Obtiene los datos de estación según la ciudad
 */
export function getStationReportData(city: "cdmx" | "vienna") {
  const data = city === "cdmx" ? STATION_COMPLAINT_DATA : VIENNA_FAKE_DATA;
  console.log(
    `[getStationReportData] 🎭 USANDO DATOS FAKE - City: ${city}, Total stations:`,
    Object.keys(data).length
  );
  if (city === "vienna") {
    console.log(
      "[getStationReportData] Vienna FAKE - Estaciones:",
      Object.keys(data)
    );
    console.log(
      "[getStationReportData] Vienna FAKE - Karlsplatz (peor):",
      data["Karlsplatz"]
    );
  }
  return data;
}

/**
 * Obtiene los datos de línea según la ciudad
 */
export function getLineReportData(city: "cdmx" | "vienna") {
  return city === "cdmx" ? LINE_REPORT_DATA : LINE_REPORT_DATA_VIENNA;
}

/**
 * Obtiene las palabras clave según la ciudad
 */
export function getKeywords(city: "cdmx" | "vienna") {
  return city === "cdmx" ? PALABRAS_CLAVE : SCHLAGWORTE;
}

/**
 * Obtiene las frases de ejemplo según la ciudad
 */
export function getExamplePhrases(city: "cdmx" | "vienna") {
  return city === "cdmx" ? FRASES_EJEMPLO : BEISPIELSÄTZE;
}
