import sys
from pathlib import Path

def generate_pdf(output_path: Path):
    """
    Generates a valid 3-page PDF with genuine text streams on page 1 and page 3,
    and a blank page on page 2.
    """
    page1_text = (
        "Operating Systems: Design and Implementation.\n"
        "A process is an execution stream in the context of an address space. "
        "The CPU switches between processes according to scheduling algorithms such as Round Robin and Priority Scheduling.\n"
        "Virtual memory provides an illusion of a large and uniform memory to each process."
    )
    
    page3_text = (
        "Storage and File Systems.\n"
        "File systems organize storage blocks into hierarchical directory structures and files. "
        "Journalling file systems protect data integrity across unexpected crashes using a write-ahead log."
    )

    pdf_content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 9 0 R >> >> >>
endobj
4 0 obj
<< /Length {len(page1_text) + 60} >>
stream
BT
/F1 12 Tf
72 700 Td
({page1_text.replace(chr(10), ") ' (")}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 9 0 R >> >> >>
endobj
6 0 obj
<< /Length 0 >>
stream
endstream
endobj
7 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 8 0 R /Resources << /Font << /F1 9 0 R >> >> >>
endobj
8 0 obj
<< /Length {len(page3_text) + 60} >>
stream
BT
/F1 12 Tf
72 700 Td
({page3_text.replace(chr(10), ") ' (")}) Tj
ET
endstream
endobj
9 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 10
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000125 00000 n 
0000000244 00000 n 
0000000350 00000 n 
0000000469 00000 n 
0000000515 00000 n 
0000000634 00000 n 
0000000740 00000 n 
trailer
<< /Size 10 /Root 1 0 R >>
startxref
820
%%EOF
"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(pdf_content.encode("latin1"))
    print(f"Generated valid PDF at: {output_path}")

if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "sample_multipage.pdf"
    generate_pdf(out)
