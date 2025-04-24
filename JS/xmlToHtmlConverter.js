// xmlToHtmlConverter.js
function convertXmlToHtml(xmlString, fileName) {
    const xmlContainer = document.createElement('div');
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        const errors = xmlDoc.getElementsByTagName("parsererror");
        if (errors.length > 0) {
            throw new Error("Invalid XML: " + errors[0].textContent);
        }
        
        const htmlContent = processXmlNode(xmlDoc);
        xmlContainer.appendChild(htmlContent);
        
        return {
            success: true,
            content: xmlContainer,
            fileName: fileName
        };
        
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `Error: ${error.message}`;
        xmlContainer.appendChild(errorDiv);
        
        return {
            success: false,
            content: xmlContainer,
            fileName: fileName
        };
    }
}

function processXmlNode(xmlNode) {
    const container = document.createElement('div');
    
    Array.from(xmlNode.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            container.appendChild(processElement(node));
        } else if (node.nodeType === Node.COMMENT_NODE) {
            container.appendChild(processComment(node));
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            container.appendChild(processText(node));
        }
    });
    
    return container;
}

function processElement(element) {
    const tagName = element.tagName.toLowerCase();
    const htmlElement = document.createElement('div');
    htmlElement.className = tagName;
    
    if (element.hasAttribute('id')) {
        htmlElement.id = element.getAttribute('id');
    }
    
    switch (tagName) {
        case 'test_case':
            const idSpan = document.createElement('span');
            idSpan.className = 'test_case-id';
            idSpan.textContent = element.getAttribute('id') || '';
            htmlElement.appendChild(idSpan);
            break;
            
        case 'step':
            const stepIdSpan = document.createElement('span');
            stepIdSpan.className = 'step-id';
            stepIdSpan.textContent = `Step: ${element.getAttribute('id') || ''}`;
            htmlElement.appendChild(stepIdSpan);
            break;
            
        case 'monitor_scope':
            const scopeTitle = document.createElement('h3');
            scopeTitle.textContent = 'Monitor Scope';
            htmlElement.insertBefore(scopeTitle, htmlElement.firstChild);
            break;
    }
    
    Array.from(element.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            htmlElement.appendChild(processElement(node));
        } else if (node.nodeType === Node.COMMENT_NODE) {
            htmlElement.appendChild(processComment(node));
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            htmlElement.appendChild(processText(node));
        }
    });
    
    return htmlElement;
}

function processComment(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'xml-comment';
    commentDiv.textContent = comment.textContent;
    commentDiv.style.color = 'var(--black-tertiary)';
    commentDiv.style.fontStyle = 'italic';
    return commentDiv;
}

function processText(text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'xml-text';
    textSpan.textContent = text.textContent.trim();
    textSpan.style.color = 'var(--black-secondary)';
    return textSpan;
}