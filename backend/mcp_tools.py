"""
Purdue Finance MCP Tools
Direct tool implementations extracted from MCP server.
"""

import os
import PyPDF2

# PDF cache - loaded once at module import
pdf_cache = {
    "tuition": None,
    "fafsa": None,
    "polytechnic": None,
}

def load_pdf_text(filename: str) -> str:
    """Load and extract text from a PDF file."""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        pdf_path = os.path.join(script_dir, "data", filename)

        if not os.path.exists(pdf_path):
            return f"Error: PDF file not found: {filename}"

        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}"

        return text
    except Exception as e:
        return f"Error reading PDF {filename}: {str(e)}"

def initialize_cache():
    """Load all PDFs into cache."""
    pdf_cache["tuition"] = load_pdf_text("tuition.pdf")
    pdf_cache["fafsa"] = load_pdf_text("fafsa.pdf")
    pdf_cache["polytechnic"] = load_pdf_text("polytechnic.pdf")

def search_in_text(text: str, query: str, context_lines: int = 3) -> str:
    """Search for query terms in text and return relevant sections."""
    if not text or text.startswith("Error"):
        return text

    lines = text.split('\n')
    query_lower = query.lower()

    # Find all lines containing query terms
    matching_indices = []
    for i, line in enumerate(lines):
        if query_lower in line.lower():
            matching_indices.append(i)

    if not matching_indices:
        return f"No information found about '{query}' in the document."

    # Build result with context around matches
    result_lines = []
    covered_ranges = []

    for match_idx in matching_indices:
        start = max(0, match_idx - context_lines)
        end = min(len(lines), match_idx + context_lines + 1)

        # Avoid duplicate text
        if not any(start <= r[0] and end >= r[1] for r in covered_ranges):
            result_lines.extend(lines[start:end])
            result_lines.append("---")
            covered_ranges.append((start, end))

    return '\n'.join(result_lines[:1000])  # Limit output to 1000 lines

# Initialize cache on module import
initialize_cache()

# ============================================================================
# Tool Functions
# ============================================================================

def search_tuition_data(query: str) -> str:
    """Search Purdue tuition and fees data for 2026-2027 academic year.

    Args:
        query: Search term (e.g., "part-time Indiana resident", "general service fee")

    Returns:
        Relevant sections from the tuition and fees PDF
    """
    return search_in_text(pdf_cache["tuition"], query)

def search_financial_aid(query: str) -> str:
    """Search FAFSA and financial aid information.

    Args:
        query: Search term (e.g., "FAFSA deadline", "scholarship", "financial aid")

    Returns:
        Relevant sections from the FAFSA PDF
    """
    return search_in_text(pdf_cache["fafsa"], query)

def search_polytechnic_costs(query: str) -> str:
    """Search Purdue Polytechnic-specific costs and fees.

    Args:
        query: Search term (e.g., "differential fee", "engineering", "technology")

    Returns:
        Relevant sections from the Polytechnic costs PDF
    """
    return search_in_text(pdf_cache["polytechnic"], query)

def calculate_total_cost(resident: bool, credits_per_semester: int, semesters: int) -> str:
    """Calculate estimated total cost based on residency and enrollment.

    Args:
        resident: True if Indiana resident, False if non-resident
        credits_per_semester: Credit hours per semester
        semesters: Number of semesters

    Returns:
        Estimated cost calculation based on PDF data
    """
    residency_type = "Indiana Resident" if resident else "Non-Resident"
    enrollment_type = "Part-time" if credits_per_semester < 12 else "Full-time"

    query = f"{residency_type} {enrollment_type} {credits_per_semester} credits"
    results = search_in_text(pdf_cache["tuition"], query)

    summary = f"""
Cost Calculation Request:
- Residency: {residency_type}
- Enrollment Type: {enrollment_type} ({credits_per_semester} credits/semester)
- Number of Semesters: {semesters}

Relevant Fee Information:
{results}

Note: For exact calculations, refer to the complete tuition schedule in the Purdue Finance office documentation.
"""
    return summary

def get_important_deadlines() -> str:
    """Get important financial aid and enrollment deadlines.

    Returns:
        Key deadlines from FAFSA and financial aid documents
    """
    deadline_queries = ["deadline", "priority", "FAFSA", "application", "spring", "fall", "January", "March"]

    all_deadlines = []
    for query in deadline_queries:
        result = search_in_text(pdf_cache["fafsa"], query, context_lines=2)
        if result and not result.startswith("No information"):
            all_deadlines.append(result[:300])  # Limit each result

    if all_deadlines:
        return "\n\n---\n\n".join(all_deadlines[:5])  # Return top 5 results
    else:
        return "Please refer to the official Purdue Financial Aid website for current deadlines."
