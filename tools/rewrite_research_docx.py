from __future__ import annotations

from copy import deepcopy
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import xml.etree.ElementTree as ET


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"w": W_NS}

ET.register_namespace("w", W_NS)
ET.register_namespace("xml", XML_NS)


PARAGRAPH_REPLACEMENTS = {
    5: (
        "Making education accessible is still a major challenge for students with "
        "disabilities, including visual and hearing impairments and "
        "neurodevelopmental conditions. Most conventional e-learning platforms are "
        "built for general learners and do not offer the adaptive interfaces or "
        "assistive tools needed for inclusive learning. Because of this, many "
        "students with special educational needs face barriers when accessing "
        "content, interacting with digital systems, and participating fully in "
        "online classes."
    ),
    6: (
        "Recent advances in artificial intelligence (AI) offer practical ways to "
        "reduce these challenges through smarter assistive technologies. AI-based "
        "systems can study user interactions, adapt learning support, and enable "
        "multimodal communication through speech recognition, text-to-speech, and "
        "intelligent tutoring. When these capabilities are brought together, digital "
        "learning platforms can become more inclusive and better suited to diverse "
        "learning needs."
    ),
    7: (
        "This study presents a Smart Assistive Learning System using Artificial "
        "Intelligence for Special Education, developed to improve accessibility and "
        "provide more personalized learning support for students with disabilities. "
        "The proposed platform combines voice navigation, automatic subtitle "
        "generation, AI tutoring assistance, and adaptive interface customization to "
        "make learning easier to access. Its architecture includes a web-based "
        "frontend, a backend service layer, an AI processing module, and a "
        "centralized database for learning content and user interaction data."
    ),
    8: (
        "AI models are used to interpret user queries, generate context-aware "
        "explanations, and support interactive learning experiences."
    ),
    11: (
        "Speech recognition allows visually impaired students to move through the "
        "platform using voice commands, while automated transcription generates "
        "real-time subtitles for multimedia educational content. In addition, an AI "
        "tutoring assistant offers personalized guidance and simplified explanations "
        "to improve understanding."
    ),
    12: (
        "Experimental results show that the proposed system improves accessibility, "
        "user engagement, and interaction efficiency when compared with traditional "
        "e-learning platforms. The study highlights how artificial intelligence can "
        "help create inclusive digital learning environments that respond to a wide "
        "range of educational needs."
    ),
    15: (
        "Education is a basic right and should be available to everyone, regardless "
        "of physical or cognitive limitations. In practice, however, traditional "
        "education systems and many digital learning platforms do not fully support "
        "students with disabilities. Learners with visual impairments often depend "
        "on audio interfaces and screen readers, hearing-impaired learners need "
        "subtitles or sign-language support for audiovisual content, and students "
        "with autism or other cognitive conditions benefit from structured "
        "environments with adaptive guidance."
    ),
    16: (
        "Even though digital learning technologies are now widely used, "
        "accessibility is still a serious concern in online education. Most "
        "e-learning systems are created for general users and rely heavily on visual "
        "interaction, which can exclude learners with disabilities. When features "
        "such as voice navigation, automated captioning, and intelligent tutoring "
        "are missing, these platforms become far less effective for special "
        "education."
    ),
    17: (
        "Artificial intelligence has become a powerful tool for addressing these "
        "gaps by enabling adaptive and responsive learning systems. AI can analyze "
        "user behavior, personalize content, and support natural forms of "
        "interaction such as speech recognition and conversational interfaces. These "
        "capabilities make it possible for learning platforms to adjust to "
        "individual needs and deliver more meaningful educational support."
    ),
    18: (
        "Bringing AI technologies into assistive learning platforms can "
        "significantly improve accessibility. Voice-based interaction helps "
        "visually impaired students explore learning content independently, while "
        "automatic subtitle generation helps hearing-impaired learners follow "
        "multimedia lessons. At the same time, AI tutoring systems can respond to "
        "user questions with personalized explanations and learning support."
    ),
    19: (
        "This work proposes a Smart Assistive Learning System powered by Artificial "
        "Intelligence to support inclusive digital education. The platform brings "
        "multiple assistive technologies together in one environment, allowing "
        "students with disabilities to access educational content through text, "
        "voice, and AI-guided interaction. By combining AI with accessible "
        "interface design, the system aims to create a more inclusive and effective "
        "digital learning experience."
    ),
    24: (
        "Table I compares several learning platforms commonly used in education. "
        "Traditional classroom learning enables direct interaction between students "
        "and teachers, but it offers limited flexibility. Standard e-learning "
        "platforms support remote access to learning materials, yet they often do "
        "not address accessibility requirements."
    ),
    25: (
        "Screen-reader-based systems give visually impaired learners audio access to "
        "written content, while caption-based video platforms support "
        "hearing-impaired students through subtitles. Even so, these solutions "
        "usually operate as separate tools and do not provide intelligent academic "
        "assistance."
    ),
    26: (
        "The proposed AI-based assistive learning platform combines voice "
        "interaction, automated caption generation, and AI tutoring support in a "
        "single system, offering a more complete solution for inclusive education."
    ),
    32: (
        "A number of studies have examined how assistive technologies can support "
        "students with disabilities in educational settings. Early assistive "
        "learning platforms mainly depended on screen readers and basic "
        "text-to-speech tools to provide audio access to digital content. While "
        "these systems helped visually impaired learners read textual information, "
        "they offered only limited interaction."
    ),
    33: (
        "More recent work has explored the role of artificial intelligence in "
        "assistive learning systems. Intelligent tutoring systems, for example, have "
        "been designed to analyze learner responses and adapt instructional "
        "strategies to provide personalized support. These approaches have shown "
        "strong potential for improving learning outcomes among students with "
        "diverse educational needs."
    ),
    34: (
        "Speech recognition has also become an important technology in accessibility "
        "applications. Voice-controlled interfaces allow users to interact with "
        "digital systems without depending on visual input devices. This is "
        "especially helpful for visually impaired learners who may find conventional "
        "graphical interfaces difficult to use."
    ),
    35: (
        "However, many existing assistive learning solutions focus on just one "
        "accessibility feature and do not integrate multiple forms of support within "
        "the same environment. This gap points to the need for a comprehensive "
        "AI-driven platform that can serve learners with different types of "
        "disabilities at the same time."
    ),
    38: (
        "Artificial intelligence has played a major role in shaping modern "
        "educational technology. AI-enabled learning platforms use machine learning "
        "techniques to understand student behavior, recommend suitable resources, "
        "and deliver personalized academic assistance."
    ),
    39: (
        "Conversational AI systems are increasingly being used as virtual tutors in "
        "online learning. These systems let students ask questions in natural "
        "language and receive explanations or guidance on academic topics. With the "
        "help of natural language processing, AI tutors can generate context-aware "
        "responses and help learners understand difficult concepts more easily."
    ),
    40: (
        "Automatic transcription and caption generation have also improved "
        "accessibility in multimedia learning spaces. By converting spoken material "
        "into text, these technologies make video lectures more accessible to "
        "hearing-impaired learners."
    ),
    41: (
        "Despite this progress, most AI-based learning platforms are not built "
        "specifically for special education. They often miss key features such as "
        "adaptive interfaces, voice-based navigation, and multimodal interaction "
        "methods that are essential for truly inclusive learning environments."
    ),
    48: (
        "Table II summarizes existing technologies used in assistive learning "
        "systems. Although many of these systems provide useful individual "
        "accessibility features, only a small number combine multiple assistive "
        "technologies in one learning environment."
    ),
    49: (
        "The proposed system addresses this gap by bringing together AI tutoring, "
        "voice navigation, automatic subtitle generation, and adaptive user "
        "interfaces within a single platform."
    ),
    53: (
        "The dataset used in this study includes educational interaction data "
        "collected from simulated learning sessions along with publicly available "
        "educational datasets. It contains different forms of user interaction, "
        "such as voice commands, text queries, learning-module activity, and "
        "conversations with the AI tutor."
    ),
    54: (
        "This dataset was used to evaluate how effectively the proposed assistive "
        "learning system supports different accessibility scenarios. It includes "
        "samples representing visually impaired users, hearing-impaired users, and "
        "learners who require guided tutoring support."
    ),
    55: "To improve reliability, the dataset was divided into three subsets:",
    56: "Training set - 70% Validation set - 15% Testing set - 15%",
    57: (
        "Before model training, the data was preprocessed using techniques such as "
        "text normalization, speech transcription, and query classification."
    ),
    60: (
        "The Smart Assistive Learning System follows a modular architecture that "
        "combines accessible interface components, backend services, artificial "
        "intelligence modules, and a centralized database. The goal of this design "
        "is to create an inclusive digital learning environment that can support "
        "students with different accessibility needs."
    ),
    66: (
        "The frontend is designed as a web-based application with accessibility "
        "features such as voice navigation, adjustable font sizes, high-contrast "
        "display modes, and simplified menus. These features help users with visual "
        "impairments or cognitive learning challenges interact with the system more "
        "comfortably and efficiently."
    ),
    67: (
        "The backend processing module manages user authentication, request "
        "handling, and communication between the frontend and the AI engine. "
        "FastAPI is used to implement backend services so that API communication "
        "remains efficient and scalable."
    ),
    68: (
        "The artificial intelligence engine handles user queries and produces "
        "context-aware responses using natural language processing. It supports "
        "conversational tutoring, automatic subtitle generation, and adaptive "
        "learning recommendations."
    ),
    69: (
        "The database management system stores user profiles, learning progress, "
        "and system interaction logs. This information is later used for analytics, "
        "monitoring, and system improvement."
    ),
    70: (
        "By integrating these components, the system can deliver real-time "
        "assistive support and more personalized learning experiences for students "
        "with special educational needs."
    ),
    75: (
        "The Smart Assistive Learning System uses a multi-stage architecture that "
        "combines artificial intelligence technologies with accessible interface "
        "design."
    ),
    77: (
        "Frontend Interface Backend Processing Module Artificial Intelligence Engine "
        "Database Management System"
    ),
    78: (
        "The frontend provides accessible interaction features such as voice "
        "navigation, adjustable text size, high-contrast display modes, and "
        "simplified menus. These functions make it easier for students with "
        "disabilities to use the platform."
    ),
    79: (
        "The backend processing module manages authentication, request handling, and "
        "communication with the AI engine. API services are implemented to connect "
        "the frontend with the AI processing modules."
    ),
    80: (
        "The AI engine processes user queries using natural language processing "
        "techniques. When a student submits a question, the system converts it into "
        "a structured prompt for a large language model. The model then returns "
        "contextual explanations and learning support tailored to the user's "
        "educational needs."
    ),
    81: (
        "Speech recognition modules convert voice commands into text, while "
        "text-to-speech modules turn AI-generated responses into audio output for "
        "visually impaired users."
    ),
    87: (
        "Experimental evaluation shows that the proposed assistive learning system "
        "improves accessibility and user interaction efficiency when compared with "
        "conventional e-learning platforms."
    ),
    88: (
        "Voice navigation achieved an accuracy of over 94%, while automatic "
        "subtitle generation recorded transcription accuracy above 92%. User "
        "testing also showed that visually impaired learners could move through "
        "learning modules more efficiently with voice commands than with "
        "traditional keyboard-based interaction."
    ),
    89: (
        "The AI tutoring assistant successfully delivered contextual explanations "
        "for user queries and helped improve student engagement with the learning "
        "materials."
    ),
    90: (
        "The integrated design of the platform allowed voice navigation, subtitle "
        "generation, and AI tutoring to work together in a single learning "
        "environment. This reduced interaction barriers and created a smoother "
        "experience than using separate assistive tools for different tasks."
    ),
    91: (
        "Although the initial results are promising, the evaluation was conducted "
        "on limited and partially simulated data. Broader testing with real users "
        "across different accessibility groups would provide stronger evidence of "
        "the system's performance in practical educational settings."
    ),
    92: (
        "This section presents the experimental findings and performance evaluation "
        "of the proposed Smart Assistive Learning System using Artificial "
        "Intelligence. The evaluation focuses on how effectively the system "
        "improves accessibility and learning interaction for students with special "
        "educational needs. Key modules such as voice navigation, automatic "
        "subtitle generation, and AI tutoring support were assessed using "
        "interaction datasets and simulated learning sessions."
    ),
    93: (
        "The evaluation process involved testing different forms of user "
        "interaction, including voice commands, text queries, and multimedia "
        "learning content. These tests were used to measure accuracy, response "
        "efficiency, and overall usability in accessible digital learning "
        "environments."
    ),
    94: (
        "The proposed system combines multiple AI technologies, including speech "
        "recognition, natural language processing, and automatic transcription. The "
        "results show that integrating these technologies can improve "
        "accessibility more effectively than conventional e-learning platforms."
    ),
    97: (
        "This research proposed a Smart Assistive Learning System powered by "
        "Artificial Intelligence to improve accessibility and enrich the learning "
        "experience of students with special educational needs. The main goal of "
        "the study was to address the limitations of conventional e-learning "
        "platforms, which often do not include the accessibility features required "
        "by students with visual impairments, hearing impairments, or cognitive "
        "learning challenges. Traditional digital learning systems depend heavily "
        "on graphical interfaces and text-based interaction, which can create "
        "barriers for learners who need alternative ways to engage."
    ),
    98: (
        "The proposed system combines voice navigation, automatic subtitle "
        "generation, AI-based tutoring support, and adaptive interface design to "
        "create a more inclusive digital learning environment. These features allow "
        "students to interact with educational content through voice commands, text "
        "queries, and audio responses. By supporting multimodal interaction, the "
        "platform helps learners with different accessibility needs take part more "
        "effectively in digital learning."
    ),
    99: (
        "The architecture of the proposed system includes a frontend interface, a "
        "backend processing module, an artificial intelligence engine, and a "
        "database management system. The frontend offers accessibility features "
        "such as adjustable font sizes, high-contrast display modes, and "
        "simplified menus to improve usability for students with visual or "
        "cognitive challenges. The backend module handles user authentication, "
        "system requests, and communication with the AI engine."
    ),
    100: (
        "The artificial intelligence component is central to the system. Natural "
        "language processing is used to interpret user queries and generate "
        "contextual responses through the AI tutoring assistant. This "
        "conversational module allows students to ask academic questions and "
        "receive simpler explanations, improving both understanding and engagement. "
        "In addition, speech recognition converts voice commands into text so that "
        "visually impaired learners can use the platform without depending on "
        "conventional input devices."
    ),
    101: (
        "Another important feature is automatic subtitle generation for multimedia "
        "educational content. By converting spoken lecture audio into text captions "
        "through speech-to-text technology, the system helps hearing-impaired "
        "students follow video lessons more effectively. When combined with AI "
        "tutoring assistance, subtitle generation makes educational materials even "
        "more accessible."
    ),
    102: (
        "The dataset used in this research included voice commands, student "
        "queries, learning activity logs, and subtitle transcription data. These "
        "inputs made it possible to evaluate key assistive components such as "
        "speech recognition, conversational AI, and subtitle generation. "
        "Experimental results showed that voice navigation reached about 94% "
        "accuracy, subtitle generation exceeded 92% transcription accuracy, and "
        "the AI tutoring assistant achieved about 96% response accuracy, "
        "indicating strong performance in contextual educational support."
    ),
    103: (
        "The findings show that combining artificial intelligence with accessible "
        "interface design can significantly improve the usability and effectiveness "
        "of digital learning platforms for students with disabilities. Beyond "
        "improving access, the proposed Smart Assistive Learning System also "
        "increases learning engagement by offering personalized assistance and "
        "interactive support. These strengths make it a promising solution for "
        "inclusive education in modern digital learning environments."
    ),
    104: (
        "Even with these encouraging results, several challenges remain for future "
        "research. One limitation of the current system is that it mainly supports "
        "text- and voice-based interaction. Future work could add technologies such "
        "as gesture recognition and sign language translation to support a wider "
        "range of disabilities. Computer vision could also be used for real-time "
        "sign language interpretation for hearing-impaired learners."
    ),
    105: (
        "Another area for improvement is the personalization capability of the AI "
        "tutor. Future versions could use adaptive learning algorithms to study "
        "each student's learning pattern and adjust educational content "
        "dynamically as progress changes. This would enable more effective "
        "personalized learning for students with diverse educational needs."
    ),
    106: (
        "Future research could also examine multilingual support so that learners "
        "can interact with the platform in different languages. This would make "
        "the system more accessible to a broader audience and improve usability "
        "for students who prefer to learn in their native language."
    ),
    107: (
        "In addition, deploying the system on cloud infrastructure could improve "
        "scalability and make it easier to reach remote or underserved areas where "
        "educational resources are limited. Mobile-based interfaces could also be "
        "developed so students can access assistive learning tools through "
        "smartphones or tablets."
    ),
    108: (
        "Overall, the Smart Assistive Learning System shows how artificial "
        "intelligence can help transform digital education into a more inclusive "
        "and accessible environment. By combining advanced AI capabilities with "
        "accessibility-focused interface design, the proposed system contributes to "
        "the development of intelligent educational platforms that support learners "
        "with diverse abilities. The results of this research reinforce the "
        "importance of pairing technological innovation with inclusive design so "
        "that all students have equitable access to educational opportunities."
    ),
}


def set_paragraph_text(paragraph: ET.Element, new_text: str) -> None:
    text_nodes = paragraph.findall(".//w:t", NS)
    if not text_nodes:
        return

    first = text_nodes[0]
    first.text = new_text

    for node in text_nodes[1:]:
        node.text = ""


def rewrite_document_xml(xml_bytes: bytes) -> bytes:
    tree = ET.parse(BytesIO(xml_bytes))
    root = tree.getroot()
    body = root.find("w:body", NS)
    if body is None:
        raise ValueError("Document body not found")

    paragraphs = body.findall("w:p", NS)
    for index, paragraph in enumerate(paragraphs):
        if index in PARAGRAPH_REPLACEMENTS:
            set_paragraph_text(paragraph, PARAGRAPH_REPLACEMENTS[index])

    output = BytesIO()
    tree.write(output, encoding="utf-8", xml_declaration=True)
    return output.getvalue()


def build_updated_docx(source: Path, destination: Path) -> None:
    with ZipFile(source, "r") as src_zip:
        file_map = {info.filename: src_zip.read(info.filename) for info in src_zip.infolist()}

    file_map["word/document.xml"] = rewrite_document_xml(file_map["word/document.xml"])

    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as dst_zip:
        for name, content in file_map.items():
            dst_zip.writestr(name, content)


def main() -> None:
    source = Path(r"C:\Users\DEEPAK\Downloads\Draft_Main.docx")
    destination = Path(r"C:\Users\DEEPAK\Desktop\Internship_Main\research.docx")
    build_updated_docx(source, destination)
    print(destination)


if __name__ == "__main__":
    main()
