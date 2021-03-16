const Command = require('./shared/Command');
const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const { desaturate } = require('./shared/Canvas');

module.exports = class DesaturateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'desaturate',
			aliases: ['saturate'],
			group: 'edit-image',
			memberName: 'desaturate',
			description: 'Draws an image or a user\'s avatar but desaturated.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'level',
					prompt: 'What level of desaturation would you like to use?',
					type: 'integer'
				},
				{
					key: 'image',
					prompt: 'What image would you like to edit?',
					type: 'image-or-avatar',
					default: msg => msg.author.displayAvatarURL({ format: 'png', size: 512 })
				}
			]
		});
	}

	async run(msg, { level, image }) {
		try {
			const { body } = await request.get(image);
			const data = await loadImage(body);
			const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(data, 0, 0);
			desaturate(ctx, level, 0, 0, data.width, data.height);
			const attachment = canvas.toBuffer();
			if (Buffer.byteLength(attachment) > 8e+6) return msg.reply('Resulting image was above 8 MB.');
			return msg.say({ files: [{ attachment, name: 'desaturate.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
