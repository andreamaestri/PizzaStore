import { useState } from 'react';

export function useNavigation(initialItems, defaultSelectedIndex = 0) {
  const [navItems, setNavItems] = useState(initialItems);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);

  // Selects a navigation item by its index.
  const selectItem = (index) => {
    setSelectedIndex(index);
  };

  // Toggles the visibility of children for an item with nested navigation.
  const toggleItemChildren = (index) => {
    setNavItems((prevItems) =>
      prevItems.map((item) =>
        item.index === index
          ? { ...item, showChildren: !item.showChildren }
          : item
      )
    );
  };

  // Gets the component associated with the currently selected index.
  const getSelectedComponent = () => {
    // First, check top-level items.
    const topLevelItem = navItems.find(item => item.index === selectedIndex);
    if (topLevelItem?.component) {
      return topLevelItem.component;
    }

    // Then, check nested items if no top-level match was found.
    for (const item of navItems) {
      if (item.children) {
        const selectedChild = item.children.find(
          child => child.index === selectedIndex
        );
        if (selectedChild?.component) {
          return selectedChild.component;
        }
      }
    }

    // Return null if no matching component is found.
    return null;
  };

  return {
    navItems,
    selectedIndex,
    selectItem,
    toggleItemChildren,
    getSelectedComponent,
  };
}
