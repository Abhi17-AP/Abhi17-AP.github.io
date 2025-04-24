// Store references to all frames
const leftFrame = window.parent.frames.leftFrame;
const middleFrame = window.parent.frames.middleFrame;
const rightFrame = window.parent.frames.rightFrame;

// Initialize only in the left frame
if (window === leftFrame) {
    const folderInput = document.getElementById('folder-input');
    const browseBtn = document.getElementById('browse-btn');
    const folderTree = document.getElementById('folder-tree');
    
    let currentFiles = [];
    let folderStructure = {};
    let currentFolderPath = '';
    
    browseBtn.addEventListener('click', function() {
        folderInput.value = '';
        folderInput.click();
    });
    
    folderInput.addEventListener('change', function(event) {
        const files = Array.from(event.target.files);
        currentFiles = files;
        
        // Reset UI
        folderTree.innerHTML = '';
        middleFrame.document.getElementById('file-list').innerHTML = '';
        rightFrame.document.getElementById('xml-viewer').innerHTML = '';
        rightFrame.document.getElementById('current-file').textContent = 'No file selected';
        currentFolderPath = '';
        
        if (files.length > 0) {
            // Build folder structure
            folderStructure = {};
            buildFolderStructure(files);
            
            // Update file count
            updateFileCount('');
            
            // Render folder structure (folders only)
            renderFolderStructure(folderStructure, folderTree);
        } else {
            middleFrame.document.getElementById('file-count').textContent = '0 files';
        }
    });
    
    function buildFolderStructure(files) {
        for (let file of files) {
            const pathParts = file.webkitRelativePath.split('/');
            let currentLevel = folderStructure;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!currentLevel[part]) {
                    currentLevel[part] = { __files: [] };
                }
                currentLevel = currentLevel[part];
            }
            
            // Store file reference
            if (!currentLevel.__files) {
                currentLevel.__files = [];
            }
            currentLevel.__files.push(file);
        }
    }
    
    function renderFolderStructure(folder, parentElement, currentPath = '') {
        for (const [name, contents] of Object.entries(folder)) {
            if (name === '__files') continue;
            
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            const folderElement = document.createElement('div');
            folderElement.className = 'folder expanded';
            folderElement.textContent = name;
            folderElement.dataset.path = fullPath;
            
            const contentsElement = document.createElement('div');
            contentsElement.className = 'contents';
            
            // Render subfolders only
            renderFolderStructure(contents, contentsElement, fullPath);
            
            folderElement.appendChild(contentsElement);
            parentElement.appendChild(folderElement);
            
            // Add click event to toggle folder and show its files
            folderElement.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Toggle folder expand/collapse
                this.classList.toggle('expanded');
                this.classList.toggle('collapsed');
                
                // Only update file list if this is a direct click (not from propagation)
                if (e.target === this) {
                    currentFolderPath = this.dataset.path;
                    displayFilesForCurrentFolder();
                }
            });
        }
    }
    
    function displayFilesForCurrentFolder() {
        const xmlFiles = getFilesInFolder(currentFolderPath)
            .filter(file => file.name.endsWith('.xml'));
        
        middleFrame.displayXmlFiles(xmlFiles);
        updateFileCount(xmlFiles.length);
    }
    
    function getFilesInFolder(folderPath) {
        if (!folderPath) return [];
        
        const pathParts = folderPath.split('/');
        let currentLevel = folderStructure;
        
        for (const part of pathParts) {
            if (currentLevel[part]) {
                currentLevel = currentLevel[part];
            } else {
                return [];
            }
        }
        
        return currentLevel.__files || [];
    }
    
    function updateFileCount(count) {
        middleFrame.document.getElementById('file-count').textContent = 
            `${count} XML file${count !== 1 ? 's' : ''}`;
    }
}

// Middle frame functions
if (window === middleFrame) {
    window.displayXmlFiles = function(files) {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = file.name;
            fileItem.dataset.path = file.webkitRelativePath;
            
            fileItem.addEventListener('click', function() {
                rightFrame.displayXmlFile(file);
                highlightSelectedFile(this);
            });
            
            fileList.appendChild(fileItem);
        });
    };
    
    function highlightSelectedFile(selectedElement) {
        // Remove selection from all files
        document.querySelectorAll('.file-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked file
        selectedElement.classList.add('selected');
    }
}

// Right frame functions
// Right frame functions
if (window === rightFrame) {
    window.displayXmlFile = function(file) {
        document.getElementById('current-file').textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const xmlContent = e.target.result;
            const xmlViewer = document.getElementById('xml-viewer');
            xmlViewer.innerHTML = '';
            
            // Use the XML to HTML converter
            const result = convertXmlToHtml(xmlContent, file.name);
            xmlViewer.appendChild(result.content);
            
            // Apply syntax highlighting
            applyXmlHighlighting(xmlViewer);
        };
        reader.readAsText(file);
    };
    
    function applyXmlHighlighting(container) {
        // Add specific classes for syntax highlighting
        const tagNames = container.querySelectorAll('.xml-tag-name');
        tagNames.forEach(el => el.classList.add('xml-tag-name'));
        
        const attrNames = container.querySelectorAll('.xml-attr-name');
        attrNames.forEach(el => el.classList.add('xml-attribute'));
        
        const attrValues = container.querySelectorAll('.xml-attr-value');
        attrValues.forEach(el => el.classList.add('xml-attribute-value'));
        
        const comments = container.querySelectorAll('.xml-comment');
        comments.forEach(el => el.classList.add('xml-comment'));
    }
}