function normalizeIndex(index, max) {
	if (index < 0) {
		return max;
	}
	if (index > max) {
		return 0;
	}
	return index;
}

export function initializeTabs(container) {
	const tabList = container.querySelector("ul");
	const links = Array.from(tabList.querySelectorAll("a[href^='#']"));
	const tabs = links.map((link, index) => {
		const panel = container.querySelector(link.getAttribute("href"));
		const tabId = `tab-${index}`;

		link.id = tabId;
		link.setAttribute("role", "tab");
		link.setAttribute("aria-controls", panel.id);
		link.setAttribute("tabindex", "-1");
		panel.setAttribute("role", "tabpanel");
		panel.setAttribute("aria-labelledby", tabId);

		return { link, panel };
	});

	tabList.setAttribute("role", "tablist");

	const activate = (index, focus) => {
		tabs.forEach((tab, tabIndex) => {
			const selected = tabIndex === index;
			tab.link.setAttribute("aria-selected", String(selected));
			tab.link.setAttribute("tabindex", selected ? "0" : "-1");
			tab.panel.hidden = !selected;
		});

		if (focus) {
			tabs[index].link.focus();
		}
	};

	let initialIndex = 0;
	if (window.location.hash) {
		const hashIndex = tabs.findIndex(
			(tab) => `#${tab.panel.id}` === window.location.hash,
		);
		if (hashIndex >= 0) {
			initialIndex = hashIndex;
		}
	}
	activate(initialIndex, false);

	tabs.forEach((tab, index) => {
		tab.link.addEventListener("click", (event) => {
			event.preventDefault();
			activate(index, true);
			history.replaceState(null, "", `#${tab.panel.id}`);
		});

		tab.link.addEventListener("keydown", (event) => {
			let nextIndex = index;
			switch (event.key) {
				case "ArrowRight":
					nextIndex = normalizeIndex(index + 1, tabs.length - 1);
					break;
				case "ArrowLeft":
					nextIndex = normalizeIndex(index - 1, tabs.length - 1);
					break;
				case "Home":
					nextIndex = 0;
					break;
				case "End":
					nextIndex = tabs.length - 1;
					break;
				case "Enter":
				case " ":
					event.preventDefault();
					activate(index, true);
					return;
				default:
					return;
			}
			event.preventDefault();
			activate(nextIndex, true);
		});
	});
}

export function initializeAccordion(container) {
	const headers = Array.from(container.querySelectorAll(":scope > h3"));
	const items = headers
		.map((header, index) => {
			const panel = header.nextElementSibling;
			if (!panel) {
				return null;
			}
			const headerId = `accordion-header-${index}`;
			const panelId = `accordion-panel-${index}`;

			header.id = headerId;
			header.setAttribute("role", "button");
			header.setAttribute("tabindex", "0");
			header.setAttribute("aria-controls", panelId);
			panel.id = panelId;
			panel.setAttribute("role", "region");
			panel.setAttribute("aria-labelledby", headerId);

			return { header, panel };
		})
		.filter(Boolean);

	const activate = (index, focus) => {
		items.forEach((item, itemIndex) => {
			const expanded = itemIndex === index;
			item.header.setAttribute("aria-expanded", String(expanded));
			item.header.classList.toggle("is-open", expanded);
			item.panel.hidden = !expanded;
		});

		if (focus) {
			items[index].header.focus();
		}
	};

	activate(0, false);

	items.forEach((item, index) => {
		item.header.addEventListener("click", () => {
			activate(index, true);
		});

		item.header.addEventListener("keydown", (event) => {
			let nextIndex = index;
			switch (event.key) {
				case "ArrowDown":
					nextIndex = normalizeIndex(index + 1, items.length - 1);
					break;
				case "ArrowUp":
					nextIndex = normalizeIndex(index - 1, items.length - 1);
					break;
				case "Home":
					nextIndex = 0;
					break;
				case "End":
					nextIndex = items.length - 1;
					break;
				case "Enter":
				case " ":
					event.preventDefault();
					activate(index, true);
					return;
				default:
					return;
			}
			event.preventDefault();
			activate(nextIndex, true);
		});
	});
}
