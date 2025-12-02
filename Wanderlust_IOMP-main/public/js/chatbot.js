// === Chatbot Config ===
const webhookURL = "";

// === Toggle Chat Window ===
function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  const isVisible = chatWindow.style.display === "flex";
  chatWindow.style.display = isVisible ? "none" : "flex";

  if (!isVisible) {
    document.getElementById("chat-body").innerHTML = ""; // clear previous
    showGreeting();
  }
}

// === Send Message ===
async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  showTyping();

  try {
  const response = await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  hideTyping();

  if (!response.ok) throw new Error("Server error");

  const rawText = await response.text();
  console.log("Raw server response:", rawText); // 👈 see what’s returned

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    data = { reply: rawText };
  }

  console.log("Parsed data:", data); // 👈 check structure

  // ✅ Extract only reply text if exists
  const botReply =
    data && typeof data.reply === "string"
      ? data.reply
      : "Sorry, I didn’t understand that 😅";

  setTimeout(() => addMessage(botReply, "bot"), 100);

} catch (error) {
  console.error("Chatbot error:", error);
  addMessage("⚠️ Something went wrong. Please try again later.", "bot");
}


}

// === Add Message to Chat ===
function addMessage(text, sender) {
  const chatBody = document.getElementById("chat-body");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-msg", sender);
  msgDiv.innerText = text;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// === Typing Indicator ===
function showTyping() {
  const chatBody = document.getElementById("chat-body");
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.classList.add("chat-msg", "bot");
  typing.textContent = "Bot is typing...";
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// === Greeting on Chat Open ===
function showGreeting() {
  addMessage("👋 Hi there! I'm WanderBot. How can I help you today?", "bot");
}