/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	ActionRowBuilder,
	ActionRowData,
	APIActionRowComponent,
	APIEmbedField,
	APIMessageActionRowComponent,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ColorResolvable,
	ComponentType,
	EmbedAuthorOptions,
	EmbedBuilder,
	EmbedFooterOptions,
	Interaction,
	InteractionCollector,
	JSONEncodable,
	Message,
	MessageActionRowComponentBuilder,
	MessageActionRowComponentData,
	TextChannel
} from "discord.js";

const paginationTypeList = ["description", "field", "both"] as const;
type paginationType = (typeof paginationTypeList)[number];

interface EmbedItems {
	authors?: EmbedAuthorOptions[];
	titles?: string[];
	urls?: string[];
	colours?: ColorResolvable[];
	descriptions?: string[];
	fields?: APIEmbedField[];
	images?: string[];
	footers?: EmbedFooterOptions[];
	thumbnails?: string[];
}

interface EmbedOptions extends EmbedItems {
	duration?: number;
	itemsPerPage: number;
	paginationType: paginationType;
	nextBtn?: string;
	prevBtn?: string;
	firstBtn?: string;
	lastBtn?: string;
	showFirstLastBtns?: boolean;
	useEmoji?: boolean;
	origUser?: string;
}

interface SendOptions {
	message?: string;
	options: {
		interaction?: Interaction;
		ephemeral?: boolean;
		followUp?: boolean;
		channel?: TextChannel;
		components?: (
			| JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
			| ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
			| APIActionRowComponent<APIMessageActionRowComponent>
		)[];
	};
}

export class PaginatedEmbed {
	private options: EmbedOptions & { footers?: EmbedFooterOptions[] };
	private messageEmbed: EmbedBuilder;
	private pages: EmbedItems[] = [];

	private currentPage = 1;
	private paginate = true;

	private embedMsg: Message;

	constructor(options: EmbedOptions) {
		if (paginationTypeList.indexOf(options.paginationType) === -1) {
			throw new Error(
				"An invalid pagination type has been passed. Valid pagination types: description, field, both."
			);
		}
		this.options = options;
		this.options.showFirstLastBtns =
			typeof options.showFirstLastBtns === "undefined" ? true : options.showFirstLastBtns;
		this.messageEmbed = new EmbedBuilder();

		this.setupPages(options);
		this.changePage();
	}

	private async setupPages(items: EmbedItems) {
		const authors = items.authors ? [...items.authors] : [];
		const titles = items.titles ? [...items.titles] : [];
		const urls = items.urls ? [...items.urls] : [];
		const colours = items.colours ? [...items.colours] : [];
		const descriptions = items.descriptions ? [...items.descriptions] : [];
		const fields = items.fields ? [...items.fields] : [];
		const images = items.images ? [...items.images] : [];
		const footers = items.footers ? [...items.footers] : [];
		const thumbnails = items.thumbnails ? [...items.thumbnails] : [];
		const pages: EmbedItems[] = [];

		while (colours.length > 0 || descriptions.length > 0 || fields?.length > 0) {
			let pageDescriptions;
			let pageFields;

			if (this.options.paginationType === "field") {
				if (
					!this.options.fields ||
					this.options.fields.length < this.options.itemsPerPage
				) {
					this.paginate = false;
				} else {
					this.paginate = true;
				}

				descriptions?.splice(0, descriptions?.length);
				pageDescriptions = items.descriptions;
				pageFields = fields.splice(0, this.options.itemsPerPage);
			}

			if (this.options.paginationType === "description") {
				if (
					!this.options.descriptions ||
					this.options.descriptions.length < this.options.itemsPerPage
				) {
					this.paginate = false;
				} else {
					this.paginate = true;
				}

				fields?.splice(0, fields?.length);
				pageDescriptions = descriptions.splice(0, this.options.itemsPerPage);
				pageFields = items.fields;
			}

			if (this.options.paginationType === "both") {
				if (
					(!this.options.descriptions || this.options.descriptions.length === 0) &&
					(!this.options.fields || this.options.fields.length === 0)
				) {
					this.paginate = false;
				} else {
					this.paginate = true;
				}

				pageDescriptions = descriptions?.splice(0, this.options.itemsPerPage);
				pageFields = fields?.splice(0, this.options.itemsPerPage);
			}

			const page = {
				authors:
					authors.length > 0
						? authors.splice(0, 1)
						: pages[pages.length - 1]?.authors || [],
				titles:
					titles.length > 0
						? titles.splice(0, 1)
						: pages[pages.length - 1]?.titles || [""],
				urls: urls.length > 0 ? urls.splice(0, 1) : pages[pages.length - 1]?.urls || [""],
				colours:
					colours.length > 0
						? colours.splice(0, 1)
						: pages[pages.length - 1]?.colours || ["Random"],
				descriptions: pageDescriptions,
				fields: pageFields,
				images:
					images.length > 0
						? images.splice(0, 1)
						: pages[pages.length - 1]?.images || [undefined],
				footers:
					footers.length > 0
						? footers.splice(0, 1)
						: pages[pages.length - 1]?.footers || [undefined],
				thumbnails:
					thumbnails.length > 0
						? thumbnails.splice(0, 1)
						: pages[pages.length - 1]?.thumbnails || [undefined]
			};

			pages.push(page);
		}

		this.pages = pages;
	}

	private async changePage() {
		this.messageEmbed.setColor(this.pages[this.currentPage - 1]?.colours[0] || "Random");

		const currentPage = `${this.currentPage}`;
		const maxPage = `${this.pages.length === 0 ? 1 : this.pages.length}`;
		const pageNumber = `Page ${currentPage} of ${maxPage}`;

		const footer = this.pages[this.currentPage - 1]?.footers[0]?.text
			.replace(/{page}/gi, pageNumber)
			.replace(/{curPage}/gi, currentPage)
			.replace(/{maxPage}/gi, maxPage);

		this.messageEmbed.setFooter({
			text: footer || pageNumber,
			iconURL: this.pages[this.currentPage - 1]?.footers[0]?.iconURL
		});

		if (this.options.descriptions) {
			this.messageEmbed.setDescription(
				this.pages[this.currentPage - 1].descriptions!.join("\n")
			);
		}

		if (this.options.fields) {
			this.messageEmbed.spliceFields(
				0,
				this.messageEmbed.data.fields?.length || 0,
				...this.pages[this.currentPage - 1].fields!
			);
		}

		if (this.options.authors) {
			const author = this.pages[this.currentPage - 1].authors![0];
			if (author) {
				this.messageEmbed.setAuthor(author);
			}
		}

		if (this.options.titles) {
			const title = this.pages[this.currentPage - 1]?.titles![0];
			if (title) {
				this.messageEmbed.setTitle(title);
			}
		}

		if (this.options.urls) {
			this.messageEmbed.setURL(this.pages[this.currentPage - 1].urls![0] || undefined);
		}

		if (this.options.thumbnails) {
			this.messageEmbed.setThumbnail(this.pages[this.currentPage - 1].thumbnails![0]);
		}

		if (this.options.images) {
			this.messageEmbed.setImage(this.pages[this.currentPage - 1].images![0]);
		}
	}

	public setTitles(titles: string[]) {
		this.options.titles = titles;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setDescriptions(descriptions: string[]) {
		this.options.descriptions = descriptions;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setFields(fields: APIEmbedField[]) {
		this.options.fields = fields;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setColours(colours: ColorResolvable[]) {
		this.options.colours = colours;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public spliceFields(index: number, deleteCount: number, fields?: APIEmbedField[]) {
		this.options.fields.splice(index, deleteCount, ...(fields || []));
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setFooters(footers: EmbedFooterOptions[]) {
		this.options.footers = footers;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setImages(urls: string[]) {
		this.options.images = urls;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setThumbnails(urls: string[]) {
		this.options.thumbnails = urls;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setAuthors(authors: EmbedAuthorOptions[]) {
		this.options.authors = authors;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public setTimestamp(timestamp?: Date | number) {
		this.messageEmbed.setTimestamp(timestamp);
		return this;
	}

	public setURLs(urls: string[]) {
		this.options.urls = urls;
		this.setupPages(this.options);

		if (!this.embedMsg || !this.embedMsg.editedAt) {
			this.changePage();
		}
		return this;
	}

	public get fields() {
		return this.options.fields;
	}

	public get descriptions() {
		return this.options.descriptions;
	}

	public get colours() {
		return this.options.colours;
	}

	public async send({
		message,
		options: { interaction, ephemeral, followUp, channel, components }
	}: SendOptions) {
		if (interaction && !interaction.isRepliable())
			throw new Error("Interaction cannot be replied to.");
		channel = (interaction?.channel as TextChannel) || channel;

		if (!channel) {
			throw new Error("Please provide either an interaction or channel.");
		}

		const btnsRow = new ActionRowBuilder<ButtonBuilder>();

		if (this.options.showFirstLastBtns) {
			const firstBtn = new ButtonBuilder()
				.setCustomId("firstBtn")
				.setLabel(this.options.firstBtn || "First")
				.setStyle(ButtonStyle.Primary);
			if (this.options.useEmoji) firstBtn.setEmoji("⏮️");
			btnsRow.addComponents(firstBtn);
		}

		const prevBtn = new ButtonBuilder()
			.setCustomId("prevBtn")
			.setLabel(this.options.prevBtn || "Back")
			.setStyle(ButtonStyle.Primary);

		const nextBtn = new ButtonBuilder()
			.setCustomId("nextBtn")
			.setLabel(this.options.nextBtn || "Next")
			.setStyle(ButtonStyle.Primary);

		if (this.options.useEmoji) {
			prevBtn.setEmoji(this.options.useEmoji ? "◀️" : undefined);
			nextBtn.setEmoji(this.options.useEmoji ? "▶️" : undefined);
		}

		btnsRow.addComponents(prevBtn, nextBtn);

		if (this.options.showFirstLastBtns) {
			const lastBtn = new ButtonBuilder()
				.setCustomId("lastBtn")
				.setLabel(this.options.lastBtn || "Last")
				.setStyle(ButtonStyle.Primary);
			if (this.options.useEmoji) lastBtn.setEmoji("⏭️");
			btnsRow.addComponents(lastBtn);
		}

		let msg: Message;
		if (interaction) {
			if (interaction.isRepliable()) {
				if (followUp) {
					msg = (await interaction.followUp({
						content: message,
						embeds: [this.messageEmbed],
						components: this.paginate
							? [btnsRow, ...(components || [])]
							: [...(components || [])],
						ephemeral
					})) as Message;
				} else {
					msg = (await interaction!.reply({
						content: message,
						embeds: [this.messageEmbed],
						components: this.paginate
							? [btnsRow, ...(components || [])]
							: [...(components || [])],
						fetchReply: true,
						ephemeral
					})) as Message;
				}
			} else {
				throw new Error(
					`The interaction ${interaction.id} passed as argument cannot be replied to.`
				);
			}
		} else {
			msg = await channel.send({
				content: message,
				embeds: [this.messageEmbed],
				components: this.paginate
					? [btnsRow, ...(components || [])]
					: [...(components || [])]
			});
		}
		if (!this.paginate) return msg;

		const filter = (i: ButtonInteraction) => {
			return (
				(i.customId === "nextBtn" ||
					i.customId === "prevBtn" ||
					i.customId === "firstBtn" ||
					i.customId === "lastBtn") &&
				(typeof interaction !== "undefined"
					? i.user.id === interaction.user.id
					: !i.user.bot)
			);
		};

		let collector: InteractionCollector<ButtonInteraction>;

		if (this.options.duration) {
			collector = msg.createMessageComponentCollector({
				filter,
				componentType: ComponentType.Button,
				time: this.options.duration
			});
		} else {
			collector = msg.createMessageComponentCollector({
				filter,
				componentType: ComponentType.Button
			});
		}

		collector.on("collect", async (i: ButtonInteraction) => {
			if (this.options.origUser && i.user.id !== this.options.origUser) return;

			if (this.pages.length < 2) {
				this.currentPage = 1;

				await this.changePage();

				if (interaction) {
					await i.editReply({
						embeds: [this.messageEmbed]
					});
				} else {
					await msg.edit({
						embeds: [this.messageEmbed]
					});
				}
			}

			const action = i.customId;
			switch (action) {
				case "firstBtn":
					this.currentPage = 1;
					await i.update({ embeds: [this.messageEmbed] });
					break;
				case "nextBtn":
					this.currentPage === this.pages.length
						? (this.currentPage = 1)
						: this.currentPage++;
					await i.update({ embeds: [this.messageEmbed] });
					break;
				case "prevBtn":
					this.currentPage === 1
						? (this.currentPage = this.pages.length)
						: this.currentPage--;
					await i.update({ embeds: [this.messageEmbed] });
					break;
				case "lastBtn":
					this.currentPage = this.pages.length;
					await i.update({ embeds: [this.messageEmbed] });
					break;
			}

			await this.changePage();
			if (interaction) {
				await i.editReply({
					embeds: [this.messageEmbed]
				});
			} else {
				await msg.edit({
					embeds: [this.messageEmbed]
				});
			}
		});

		collector.on("end", (i, reason) => {
			if (reason === "messageDelete") return;
			i.forEach((int) => int.editReply({ components: [] }));
		});

		this.embedMsg = msg;
		return msg;
	}
}
