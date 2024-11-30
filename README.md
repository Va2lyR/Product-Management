# Discord Bot - Product Management

This bot allows server admins to manage and share product codes/messages within a Discord server. Users can view and choose products via an interactive dropdown menu, and admins have the ability to add new products using the `-addlist` command.

### Features:
- Display a list of available products using the `-list` command.
- Admins can add new products using the `-addlist` command.
- Products can either be normal messages or codes sent directly to users' DMs.

### Commands:
- **`-list`**: Display a list of available products. Users can select and receive the product in their DMs.
- **`-addlist`**: Admin command to add a new product to the list. Requires specifying the product name, message, and type (Code or Normal).
- **`-help`**: Displays a help message with all available commands.

### Bot Setup:

. change in `config.json` file:
    ```json
    {
      "token": "YOUR_BOT_TOKEN",
      "admins": ["ADMIN_USER_ID_1", "ADMIN_USER_ID_2"]
    }
    ```

### Dependencies:
- **discord.js**: v14.0.0
- **Node.js**: >=16.0.0

---

**Bot by @va2lyr** 💖
