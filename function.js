const chatContainer = document.getElementById('chatContainer');
        const messageForm = document.getElementById('messageForm');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const themeToggle = document.getElementById('themeToggle');
        const suggestionsChips = document.querySelectorAll('.suggestion-chip');

        // Theme toggle functionality
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            
            // Reset if empty
            if (this.value === '') {
                this.style.height = '50px';
            }
        });

        function createMessageElement(content, isUser, isError = false) {
            const messageGroup = document.createElement('div');
            messageGroup.className = `message-group ${isUser ? 'user' : ''}`;
            
            // Add staggered animation delay based on number of messages
            const delay = 0.1 * document.querySelectorAll('.message-group').length % 3;
            messageGroup.style.animationDelay = `${delay}s`;

            const avatar = document.createElement('div');
            avatar.className = `avatar ${isUser ? 'user' : 'ai'}`;
            
            const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            iconSvg.setAttribute("width", "16");
            iconSvg.setAttribute("height", "16");
            iconSvg.setAttribute("viewBox", "0 0 24 24");
            iconSvg.setAttribute("fill", "none");
            iconSvg.setAttribute("stroke", "currentColor");
            iconSvg.setAttribute("stroke-width", "2");
            iconSvg.setAttribute("stroke-linecap", "round");
            iconSvg.setAttribute("stroke-linejoin", "round");

            if (isUser) {
                iconSvg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
            } else {
                iconSvg.innerHTML = '<path d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 6a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4"></path>';
            }

            avatar.appendChild(iconSvg);

            const message = document.createElement('div');
            message.className = `message ${isUser ? 'user' : 'ai'} ${isError ? 'error-message' : ''}`;
            message.textContent = content;

            if (isUser) {
                messageGroup.appendChild(message);
                messageGroup.appendChild(avatar);
            } else {
                messageGroup.appendChild(avatar);
                messageGroup.appendChild(message);
            }

            return messageGroup;
        }

        function createTypingIndicator() {
            const messageGroup = document.createElement('div');
            messageGroup.className = 'message-group';
            messageGroup.id = 'typingIndicator';
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar ai';
            
            const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            iconSvg.setAttribute("width", "16");
            iconSvg.setAttribute("height", "16");
            iconSvg.setAttribute("viewBox", "0 0 24 24");
            iconSvg.setAttribute("fill", "none");
            iconSvg.setAttribute("stroke", "currentColor");
            iconSvg.setAttribute("stroke-width", "2");
            iconSvg.setAttribute("stroke-linecap", "round");
            iconSvg.setAttribute("stroke-linejoin", "round");
            iconSvg.innerHTML = '<path d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 6a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4"></path>';
            avatar.appendChild(iconSvg);

            const message = document.createElement('div');
            message.className = 'message ai';
            
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.className = 'typing-dot';
                typingIndicator.appendChild(dot);
            }
            
            message.appendChild(typingIndicator);
            messageGroup.appendChild(avatar);
            messageGroup.appendChild(message);
            
            return messageGroup;
        }

        async function sendMessage(message) {
            try {
                const response = await fetch('https://api.itsrose.rest/gpt/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer Prod-Sk-8e499dd622744eac3a99ca18adc1d4e5',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{
                            role: "user",
                            content: message
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.status) {
                    throw new Error(data.message || 'API response error');
                }

                return data.result.message.content;
            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }

        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = messageInput.value.trim();
            if (!message || sendButton.disabled) return;

            // Clear welcome message if it exists
            const welcomeContainer = document.querySelector('.welcome-container');
            if (welcomeContainer) {
                welcomeContainer.remove();
            }

            messageInput.value = '';
            messageInput.style.height = '50px';
            messageInput.disabled = true;
            sendButton.disabled = true;

            chatContainer.appendChild(createMessageElement(message, true));
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Add typing indicator
            const typingIndicator = createTypingIndicator();
            chatContainer.appendChild(typingIndicator);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            try {
                const response = await sendMessage(message);
                
                // Remove typing indicator
                typingIndicator.remove();
                
                // Add AI response with slight delay for natural feel
                setTimeout(() => {
                    chatContainer.appendChild(createMessageElement(response, false));
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 300);
                
            } catch (error) {
                console.error('Error:', error);
                
                // Remove typing indicator
                typingIndicator.remove();
                
                chatContainer.appendChild(createMessageElement(
                    'Maaf, terjadi kesalahan dalam komunikasi dengan AI. Silakan coba lagi.',
                    false,
                    true
                ));
            } finally {
                messageInput.disabled = false;
                sendButton.disabled = false;
                messageInput.focus();
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        });

        messageInput.addEventListener('input', () => {
            messageInput.value = messageInput.value.trimStart();
        });

        // Handle suggestion chips
        suggestionsChips.forEach(chip => {
            chip.addEventListener('click', () => {
                messageInput.value = chip.textContent;
                messageInput.dispatchEvent(new Event('input'));
                messageForm.dispatchEvent(new Event('submit'));
            });
        });

        // Focus input on page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                messageInput.focus();
            }, 500);
        });