const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  PermissionsBitField 
} = require('discord.js');
const fs = require('fs');

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const { token, admins } = config;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const products = new Map(); // To store product details (name, message, type)

// Improved startup message with colors and emojis
client.once('ready', () => {
  console.clear(); // Clear the console first for a fresh start

  console.log('\x1b[36m%s\x1b[0m', '=========================================='); // Cyan Color
  console.log('\x1b[32m%s\x1b[0m', '🚀 Bot Initialized:'); // Green Color with Rocket Emoji
  console.log('\x1b[33m%s\x1b[0m', '------------------------------------------'); // Yellow Color
  console.log('\x1b[32m%s\x1b[0m', `🌟 Bot Name: ${client.user.tag}`); // Green Color with Star Emoji
  console.log('\x1b[32m%s\x1b[0m', `🔑 Bot ID: ${client.user.id}`); // Green Color with Key Emoji
  console.log('\x1b[34m%s\x1b[0m', '✅ Logged in successfully and is now online!'); // Blue Color with Check Emoji
  console.log('\x1b[33m%s\x1b[0m', '------------------------------------------'); // Yellow Color
  console.log('\x1b[36m%s\x1b[0m', '📝 Commands:'); // Cyan Color with Notepad Emoji
  console.log('\x1b[32m%s\x1b[0m', '➡️ -list : Displays the list of available products.'); // Green with Arrow Emoji
  console.log('\x1b[32m%s\x1b[0m', '➡️ -addlist : Allows admins to add new products.'); // Green with Arrow Emoji
  console.log('\x1b[32m%s\x1b[0m', '➡️ -help : Displays this help message.'); // Green with Arrow Emoji
  console.log('\x1b[33m%s\x1b[0m', '------------------------------------------'); // Yellow Color
  console.log('\x1b[35m%s\x1b[0m', '💖 Bot by @va2lyr'); // Magenta Color with Heart Emoji
  console.log('\x1b[36m%s\x1b[0m', '=========================================='); // Cyan Color
});

// Command Handlers
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  if (command === '-help') {
      const embed = new EmbedBuilder()
          .setTitle('Bot Commands')
          .setDescription('Here is a list of available commands:')
          .addFields(
              { name: '-list', value: 'Displays a list of available products.' },
              { name: '-addlist', value: 'Allows admins to add a new product.' },
              { name: '-help', value: 'Displays this help message.' }
          )
          .setColor(0x00AE86);

      await message.reply({ embeds: [embed] });
  }

  if (command === '-list') {
      if (products.size === 0) {
          const embed = new EmbedBuilder()
              .setTitle('Product List')
              .setDescription('No products are currently available.')
              .setColor(0xFF0000);

          return message.reply({ embeds: [embed] });
      }

      const options = Array.from(products.keys()).map((name) => ({
          label: name,
          value: name,
      }));

      const menu = new StringSelectMenuBuilder()
          .setCustomId('select_product')
          .setPlaceholder('Select a product')
          .addOptions(options);

      const row = new ActionRowBuilder().addComponents(menu);

      const embed = new EmbedBuilder()
          .setTitle('Product List')
          .setDescription('Choose a product from the menu below:')
          .setColor(0x00AE86);

      await message.reply({ embeds: [embed], components: [row] });
  }

  if (command === '-addlist') {
      if (!admins.includes(message.author.id)) {
          const embed = new EmbedBuilder()
              .setTitle('Error')
              .setDescription('This command is only available to admins.')
              .setColor(0xFF0000);

          return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
          .setTitle('Add a New Product')
          .setDescription('Click the button below to add a new product.')
          .setColor(0x00AE86);

      const button = new ButtonBuilder()
          .setCustomId('add_product')
          .setLabel('Add Product')
          .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await message.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
});

// Interaction Handlers
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
      if (interaction.customId === 'add_product') {
          const modal = new ModalBuilder()
              .setCustomId('add_product_modal')
              .setTitle('Add New Product');

          const productNameInput = new TextInputBuilder()
              .setCustomId('product_name')
              .setLabel('Product Name')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Enter the product name')
              .setRequired(true);

          const productMessageInput = new TextInputBuilder()
              .setCustomId('product_message')
              .setLabel('Product Message')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Enter the message or code for the product')
              .setRequired(true);

          const productTypeInput = new TextInputBuilder()
              .setCustomId('product_type')
              .setLabel('Product Type (Code/Normal)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Enter "Code" for a code product or "Normal" for a normal product')
              .setRequired(true);

          const row1 = new ActionRowBuilder().addComponents(productNameInput);
          const row2 = new ActionRowBuilder().addComponents(productMessageInput);
          const row3 = new ActionRowBuilder().addComponents(productTypeInput);

          modal.addComponents(row1, row2, row3);

          await interaction.showModal(modal);
      }
  } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'add_product_modal') {
          const productName = interaction.fields.getTextInputValue('product_name');
          const productMessage = interaction.fields.getTextInputValue('product_message');
          const productType = interaction.fields.getTextInputValue('product_type').toLowerCase();

          if (productType !== 'code' && productType !== 'normal') {
              const embed = new EmbedBuilder()
                  .setTitle('Error')
                  .setDescription('Product type must be "Code" or "Normal".')
                  .setColor(0xFF0000);

              return interaction.reply({ embeds: [embed], ephemeral: true });
          }

          products.set(productName, { message: productMessage, type: productType });

          const embed = new EmbedBuilder()
              .setTitle('Product Added')
              .setDescription(`The product "${productName}" has been added successfully.`)
              .setColor(0x00AE86);

          await interaction.reply({ embeds: [embed], ephemeral: true });
      }
  } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_product') {
          const selectedProduct = interaction.values[0];
          const productData = products.get(selectedProduct);

          if (productData.type === 'code') {
              const dmEmbed = new EmbedBuilder()
                  .setTitle('Your Product Code')
                  .setDescription(`Here is your code: \`\`\`${productData.message}\`\`\``)
                  .setColor(0x00AE86);

              const replyEmbed = new EmbedBuilder()
                  .setTitle('Code Sent')
                  .setDescription('The code has been sent to your DMs.')
                  .setColor(0x00AE86);

              await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
              interaction.user.send({ embeds: [dmEmbed] });
          } else {
              const dmEmbed = new EmbedBuilder()
                  .setTitle('Your Product')
                  .setDescription(productData.message)
                  .setColor(0x00AE86);

              const replyEmbed = new EmbedBuilder()
                  .setTitle('Product Sent')
                  .setDescription('The product has been sent to your DMs.')
                  .setColor(0x00AE86);

              await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
              interaction.user.send({ embeds: [dmEmbed] });
          }
      }
  }
});

// Log in with the bot token
client.login(token);
