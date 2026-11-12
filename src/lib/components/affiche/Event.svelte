<script>
	// @ts-nocheck
	import { getEventImage } from '#lib/utils/imageStorage.js';

	let { event, styles, nbEvents, reverse, eventIndex, onSelectEvent, selectedEventId } = $props();

	let eventClass = $derived(['uno', 'duo', 'trio', 'quatro'][nbEvents - 1] ?? 'uno');

	let imageRight = $derived((eventIndex % 2 === 1) !== reverse);

	let titleSize = $derived(`${event.sizeTitle ?? 36}px`);
	let descriptionSize = $derived(`${event.sizeDescription ?? 25}px`);

	let imageUrl = $state(null);
	let imageReady = $state(false);

	// Charger l'image depuis IndexedDB
	$effect(() => {
		const currentEvent = event;
		const eventId = currentEvent.id;

		let cancelled = false;
		let objectUrl = null;

		imageUrl = null;
		imageReady = false;

		getEventImage(eventId)
			.then((blob) => {
				if (cancelled) return;

				if (blob) {
					objectUrl = URL.createObjectURL(blob);
					imageUrl = objectUrl;
				}

				imageReady = true;
			})
			.catch((error) => {
				console.error('Erreur lors du chargement de l’image :', error);
				imageReady = true;
			});

		return () => {
			cancelled = true;

			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	});
</script>

<div
	class={`event ${eventClass}`}
	class:reverse
	class:imageRight
	class:selected={selectedEventId === event.id}
	style:--border-color={styles.bgTitle}
	role="button"
	tabindex="0"
	onclick={() => onSelectEvent?.(event.id)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelectEvent?.(event.id);
		}
	}}
	data-image-ready={imageReady}
>
	<div class="imgContainer" style:background-image={imageUrl ? `url("${imageUrl}")` : 'none'}></div>

	<div class="infoContainer">
		<div class="dateContainer" style:background={styles.bgDate} style:color={styles.colorDate}>
			<div class="date">{event.date}</div>
			<div class="hour">{event.hour}</div>
		</div>

		<div class="descriptionContainer">
			<div
				class="title"
				style:background={styles.bgTitle}
				style:color={styles.colorTitle}
				style:font-size={titleSize}
			>
				{event.title}
			</div>

			<div class="text" style:color={styles.colorContent} style:font-size={descriptionSize}>
				{event.content}
			</div>

			<div
				class="footerInfo"
				class:hidden={!event.condition?.trim() && !event.inscription}
				style:background={styles.bgTitle}
				style:color={styles.colorTitle}
			>
				<span class="condition">{event.condition}</span>
				<span class="inscription">
					{event.inscription ? 'Sur inscription' : ''}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.event {
		width: 83.4%;
		height: 100%;
		margin: 0 auto 4.5%;
		border: 8px solid var(--border-color, black);
		box-sizing: border-box;
		border-radius: 40px 40px 0 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}

	.event:focus-visible {
		outline: 4px solid #2563eb;
		outline-offset: 4px;
	}

	.event.selected {
		box-shadow:
			0 0 0 4px #8edbff,
			0 0 8px 5px rgba(142, 219, 255, 0.95),
			0 0 20px 10px rgba(100, 190, 255, 0.8),
			0 0 35px 15px rgba(100, 190, 255, 0.5);
	}

	.imgContainer {
		background-color: rgb(202, 202, 202);
		background-position: center;
		background-size: cover;
		min-height: 0;
	}

	.infoContainer {
		display: flex;
		min-height: 0;
	}

	.dateContainer,
	.descriptionContainer {
		box-sizing: border-box;
		text-align: center;
		min-width: 0;
	}

	.dateContainer {
		line-height: 1;
	}

	.hour {
		white-space: pre-line;
	}

	.descriptionContainer {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
		overflow-wrap: break-word;
		font-weight: bold;
		line-height: 1.2;

		.title {
			flex: 0 0 auto;
			width: 100%;
		}

		.text {
			flex: 1 1 0;
			min-height: 0;
			overflow: hidden;
			white-space: pre-line;
		}

		.footerInfo {
			display: flex;
			flex: 0 0 12%;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			min-height: 0;
			padding: 0 30px;
			box-sizing: border-box;
			font-weight: bold;
			font-size: 25px;

			span {
				display: block;
			}
		}

		.footerInfo.hidden {
			display: none;
		}
	}

	/* Un évènement */
	.uno {
		.imgContainer {
			flex: 0 0 70%;
			border-bottom: 8px solid var(--border-color);
		}

		.infoContainer {
			flex: 0 0 30%;
			flex-direction: row;
		}

		.dateContainer {
			flex: 0 0 29.6%;
			border-right: 8px solid var(--border-color);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 20px;
			font-weight: bold;

			.date {
				font-size: 70px;
			}

			.hour {
				font-size: 40px;
			}
		}

		.descriptionContainer {
			flex: 1;

			.title {
				padding: 20px;
				box-sizing: border-box;
				line-height: 1.5;
				text-transform: uppercase;
			}

			.text {
				padding: 15px;
			}

			.condition,
			.inscription {
				padding: 0 15px;
			}
		}
	}

	/* Deux évènements */
	.duo {
		flex-direction: row;
		border-radius: 0 30px 30px 0;
		height: 47.9%;

		.imgContainer {
			flex: 0 0 60.8%;
			height: 100%;
			border-right: 8px solid var(--border-color);
		}

		&.imageRight {
			.imgContainer {
				border-right: none;
				border-left: 8px solid var(--border-color);
			}
		}

		.infoContainer {
			flex: 1;
			flex-direction: column;
		}

		.dateContainer {
			flex: 0 0 30%;
			border-bottom: 8px solid var(--border-color);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 10px;
			font-weight: bold;

			.date {
				font-size: 55px;
			}

			.hour {
				font-size: 30px;
			}
		}

		.descriptionContainer {
			flex: 1;

			.footerInfo {
				font-size: 20px;
			}
		}
	}

	.duo.imageRight {
		flex-direction: row-reverse;
		border-radius: 30px 0 0 30px;
	}

	/* Trois ou quatre évènements */
	.trio,
	.quatro {
		flex-direction: row;
		border-radius: 30px 0 0 30px;

		.imgContainer {
			flex: 0 0 35%;
			border-right: 8px solid var(--border-color);
		}

		&.imageRight {
			.imgContainer {
				border-right: none;
				border-left: 8px solid var(--border-color);
			}
		}

		.infoContainer {
			flex: 1;
			flex-direction: row;
		}

		.dateContainer {
			flex: 0 0 29.85%;
			border-right: 8px solid var(--border-color);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-weight: bold;

			.date {
				font-size: 46px;
			}
		}

		.descriptionContainer {
			flex: 1;

			.title {
				padding: 15px;
			}

			.footerInfo {
				font-size: 22px;
			}
		}
	}

	.trio.imageRight,
	.quatro.imageRight {
		flex-direction: row-reverse;
		border-radius: 0 30px 30px 0;
	}

	.trio {
		height: 30.5%;
	}

	.quatro {
		height: 23.9%;
		margin-bottom: 2.3%;
	}
</style>
