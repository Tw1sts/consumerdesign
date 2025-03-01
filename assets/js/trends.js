/**
 * Trend Map Visualization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Define connections with specific types - available to all functions
    const connections = [
        { from: 'sustainability', to: 'biophilic', type: 'established-to-growing' },
        { from: 'biophilic', to: 'haptic', type: 'growing-to-growing' },
        { from: 'haptic', to: 'neurodesign', type: 'growing-to-emerging' },
        { from: 'minimalism', to: 'biophilic', type: 'established-to-growing' },
        { from: 'neurodesign', to: 'adaptive', type: 'emerging-to-emerging' }
    ];
    
    // Initialize SVG connections for trend map
    function initTrendConnections() {
        const container = document.querySelector('.trends-map-container');
        if (!container) return;
        
        const svg = document.querySelector('.trend-connections');
        if (!svg) return;
        
        // Ensure SVG has the correct attributes
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 500 500');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        // Clear existing paths but keep defs
        Array.from(svg.children).forEach(child => {
            if (child.tagName.toLowerCase() !== 'defs') {
                child.remove();
            }
        });
        
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        
        // Update viewBox to match container dimensions
        svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        
        // Create connections
        connections.forEach(connection => {
            const fromNode = document.querySelector(`.trend-node[data-trend="${connection.from}"]`);
            const toNode = document.querySelector(`.trend-node[data-trend="${connection.to}"]`);
            
            if (fromNode && toNode) {
                // Get node positions relative to container
                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();
                
                // Calculate center points relative to SVG viewBox
                const x1 = fromRect.left + fromRect.width/2 - containerRect.left;
                const y1 = fromRect.top + fromRect.height/2 - containerRect.top;
                const x2 = toRect.left + toRect.width/2 - containerRect.left;
                const y2 = toRect.top + toRect.height/2 - containerRect.top;
                
                // Create SVG path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                
                // Add the type class
                path.setAttribute('class', `connection ${connection.type}`);
                path.setAttribute('style', 'opacity: 0.6;');
                
                // Calculate a control point for a slight curve
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const offset = 30; // curve intensity
                
                // Curve the line perpendicular to the line direction
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const normalX = -dy / len * offset;
                const normalY = dx / len * offset;
                
                // Create quadratic bezier curve
                const cpX = midX + normalX;
                const cpY = midY + normalY;
                
                // Set the path
                path.setAttribute('d', `M${x1},${y1} Q${cpX},${cpY} ${x2},${y2}`);
                
                // Add to SVG
                svg.appendChild(path);
            }
        });
    }
    
    // Initialize trend interactions
    function initTrendInteractions() {
        const nodes = document.querySelectorAll('.trend-node');
        const contents = document.querySelectorAll('.trend-content');
        
        nodes.forEach(node => {
            // Click event to show content
            node.addEventListener('click', () => {
                const trendId = node.getAttribute('data-trend');
                
                // Reset all nodes
                nodes.forEach(n => n.classList.remove('active'));
                
                // Activate clicked node
                node.classList.add('active');
                node.classList.add('pulse-effect');
                
                // Hide all content panels
                contents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding content
                const contentToShow = document.getElementById(`${trendId}-content`) || 
                                      document.getElementById(trendId);
                
                if (contentToShow) {
                    contentToShow.classList.add('active');
                }
                
                // Remove pulse effect after animation completes
                setTimeout(() => {
                    node.classList.remove('pulse-effect');
                }, 1000);
            });
            
            // Hover events for connections highlighting
            node.addEventListener('mouseenter', () => {
                // Get the trend ID
                const trendId = node.getAttribute('data-trend');
                
                // Find related connections
                const allConnections = document.querySelectorAll('.trend-connections .connection');
                
                // Dim all connections first
                allConnections.forEach(conn => {
                    conn.style.opacity = '0.2';
                });
                
                // Highlight relevant connections based on the defined connections array
                // Get the connections that include the current trend
                let relevantConnections = [];
                
                connections.forEach(conn => {
                    if (conn.from === trendId || conn.to === trendId) {
                        relevantConnections.push(conn);
                    }
                });

                // Highlight relevant connections based on class
                allConnections.forEach(connElement => {
                    relevantConnections.forEach(relevantConn => {
                        if (connElement.classList.contains(relevantConn.type)) {
                            connElement.style.opacity = '0.8';
                        }
                    });
                });
                
                // Highlight related nodes, dim others
                nodes.forEach(n => {
                    const otherTrendId = n.getAttribute('data-trend');
                    let isRelated = false;
                    
                    // Check if this node is part of a connection with the hovered node
                    relevantConnections.forEach(conn => {
                        if ((conn.from === trendId && conn.to === otherTrendId) || 
                            (conn.to === trendId && conn.from === otherTrendId)) {
                            isRelated = true;
                        }
                    });
                    
                    if (n !== node && !isRelated) {
                        n.style.opacity = '0.5';
                    }
                });
            });
            
            // Reset on mouse leave
            node.addEventListener('mouseleave', () => {
                const allConnections = document.querySelectorAll('.trend-connections .connection');
                allConnections.forEach(conn => {
                    conn.style.opacity = '0.6';
                });
                
                nodes.forEach(n => {
                    n.style.opacity = '1';
                });
            });
        });
    }
    
    // Initialize on load
    initTrendConnections();
    initTrendInteractions();
    
    // Reinitialize connections on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            initTrendConnections();
        }, 250);
    });
    
    // Show first trend by default
    const firstNode = document.querySelector('.trend-node');
    if (firstNode) {
        firstNode.click();
    }
});