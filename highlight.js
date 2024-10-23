document.addEventListener('DOMContentLoaded', function() {
    // Create mark.js instances for both panels
    var leftMarkInstance = new Mark(document.querySelector(".left-panel"));
    var rightMarkInstance = new Mark(document.querySelector(".right-panel"));

    // Cache DOM elements
    var searchInput = document.getElementById('search-input');
    var searchButton = document.getElementById('search-button');
    var leftContent = document.getElementById('left-content');
    var rightContent = document.getElementById('editable-content');
    var predefinedList = document.getElementById('predefined-list');
    var updateKeywordsButton = document.getElementById('update-keywords');
    var blurButton = document.getElementById('blur-button');
    var unblurButton = document.getElementById('unblur-button');

    // Predefined list of keywords
    var predefinedKeywords = ['lorem ipsum', 'dolor', 'elit', 'consectetur'];

    // Initialize the predefined keywords input
    predefinedList.value = predefinedKeywords.join(', ');

    // Copy content from left panel to right panel
    rightContent.innerHTML = leftContent.innerHTML;

    function updatePredefinedKeywords() {
        predefinedKeywords = predefinedList.value.split(',').map(keyword => keyword.trim());
        performMark();
    }

    function performMark() {
        // Read the keyword
        var keyword = searchInput.value.trim();

        // If the keyword is empty, use predefined keywords
        var keywordsToMark = keyword ? [keyword] : predefinedKeywords;

        // Remove previous marked elements and mark the new keyword inside both panels
        leftMarkInstance.unmark({
            done: function() {
                leftMarkInstance.mark(keywordsToMark);
                markNumbers(leftContent);
            }
        });

        rightMarkInstance.unmark({
            done: function() {
                rightMarkInstance.mark(keywordsToMark);
                markNumbers(rightContent);
            }
        });
    }

    // Mark numbers with a yellow background and black text
    function markNumbers(container) {
        var textNodes = getTextNodes(container);
        textNodes.forEach(function(node) {
            var text = node.nodeValue;
            var parent = node.parentNode;
            var fragments = text.split(/(\d+)/);
            
            fragments.forEach(function(fragment) {
                if (/^\d+$/.test(fragment)) {
                    var span = document.createElement('span');
                    span.className = 'number-highlight';
                    span.textContent = fragment;
                    parent.insertBefore(span, node);
                } else {
                    parent.insertBefore(document.createTextNode(fragment), node);
                }
            });
            
            parent.removeChild(node);
        });
    }

    function getTextNodes(node) {
        var textNodes = [];
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
        } else {
            var children = node.childNodes;
            for (var i = 0; i < children.length; i++) {
                textNodes = textNodes.concat(getTextNodes(children[i]));
            }
        }
        return textNodes;
    }

    function blurSelectedText() {
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            var selectedText = range.toString();
            
            if (range.startContainer.parentNode.classList.contains('blurred')) {
                // If the selected text is already blurred, unblur it
                var blurredSpan = range.startContainer.parentNode;
                var textNode = document.createTextNode(blurredSpan.getAttribute('data-original-text'));
                blurredSpan.parentNode.replaceChild(textNode, blurredSpan);
            } else {
                // If the selected text is not blurred, blur it
                var blurredText = 'x'.repeat(selectedText.length);
                
                var span = document.createElement('span');
                span.className = 'blurred';
                span.textContent = blurredText;
                span.setAttribute('data-original-text', selectedText);
                
                range.deleteContents();
                range.insertNode(span);
            }
            
            // Clear the selection
            selection.removeAllRanges();
        }
    }

    function unblurAllText() {
        var blurredSpans = document.querySelectorAll('.blurred');
        blurredSpans.forEach(function(span) {
            var textNode = document.createTextNode(span.getAttribute('data-original-text'));
            span.parentNode.replaceChild(textNode, span);
        });
    }

    // Highlight predefined keywords on page load
    performMark();

    // Listen to input changes
    searchInput.addEventListener('input', performMark);

    // Listen to search button click
    searchButton.addEventListener('click', performMark);

    // Listen to editable content changes
    leftContent.addEventListener('input', function() {
        // Delay the marking to allow the input to complete
        setTimeout(performMark, 0);
    });

    // Listen to predefined keywords update
    updateKeywordsButton.addEventListener('click', updatePredefinedKeywords);

    // Listen to blur button click
    blurButton.addEventListener('click', blurSelectedText);

    // Listen to unblur button click
    unblurButton.addEventListener('click', unblurAllText);

    // Synchronize scrolling
    var isScrolling = false;

    function syncScroll(source, target) {
        if (!isScrolling) {
            isScrolling = true;
            target.scrollTop = source.scrollTop;
            setTimeout(function() {
                isScrolling = false;
            }, 50);
        }
    }

    leftContent.addEventListener('scroll', function() {
        syncScroll(leftContent, rightContent);
    });

    rightContent.addEventListener('scroll', function() {
        syncScroll(rightContent, leftContent);
    });

    // Perform initial mark
    performMark();
});
