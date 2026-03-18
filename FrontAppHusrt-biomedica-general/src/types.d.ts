declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';
    export function applyPlugin(jsPDF: jsPDF): void;
    export default function autoTable(doc: jsPDF, options: any): void;
}
