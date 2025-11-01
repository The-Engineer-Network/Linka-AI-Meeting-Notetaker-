// types/chrome.d.ts

// Chrome Extension API type definitions
// This file provides TypeScript declarations for Chrome extension APIs

declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

declare namespace chrome {
  // Runtime API
  namespace runtime {
    interface LastError {
      message?: string;
    }

    const lastError: LastError | undefined;

    function getManifest(): any;

    interface MessageSender {
      id?: string;
      tab?: chrome.tabs.Tab;
      frameId?: number;
      url?: string;
      tlsChannelId?: string;
    }

    type MessageListener = (
      message: any,
      sender: MessageSender,
      sendResponse: (response?: any) => void
    ) => boolean | void;

    function sendMessage(
      extensionId: string | undefined,
      message: any,
      options?: object,
      callback?: (response: any) => void
    ): void;

    function sendMessage(
      message: any,
      callback?: (response: any) => void
    ): void;

    function onMessage: {
      addListener(callback: MessageListener): void;
      removeListener(callback: MessageListener): void;
    };
  }

  // Identity API
  namespace identity {
    interface TokenDetails {
      interactive?: boolean;
      scopes?: string[];
    }

    interface WebAuthFlowOptions {
      url: string;
      interactive?: boolean;
    }

    interface ProfileUserInfo {
      email: string;
      id: string;
    }

    function getAuthToken(
      details: TokenDetails,
      callback: (token?: string) => void
    ): void;

    function removeCachedAuthToken(
      details: { token: string },
      callback?: () => void
    ): void;

    function launchWebAuthFlow(
      options: WebAuthFlowOptions,
      callback: (redirectUrl?: string) => void
    ): void;

    function getProfileUserInfo(
      callback: (userInfo: ProfileUserInfo) => void
    ): void;
  }

  // Storage API
  namespace storage {
    interface StorageChange {
      newValue?: any;
      oldValue?: any;
    }

    interface StorageArea {
      get(keys?: string | string[] | object, callback?: (items: { [key: string]: any }) => void): Promise<{ [key: string]: any }>;
      set(items: object, callback?: () => void): Promise<void>;
      remove(keys: string | string[], callback?: () => void): Promise<void>;
      clear(callback?: () => void): Promise<void>;
      onChanged: {
        addListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
        removeListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      };
    }

    const sync: StorageArea;
    const local: StorageArea;
    const managed: StorageArea;
  }

  // Tabs API
  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      windowId: number;
      openerTabId?: number;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      audible?: boolean;
      mutedInfo?: MutedInfo;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }

    interface MutedInfo {
      muted: boolean;
      reason?: string;
      extensionId?: string;
    }

    interface QueryInfo {
      active?: boolean;
      audible?: boolean;
      autoDiscardable?: boolean;
      currentWindow?: boolean;
      discarded?: boolean;
      favIconUrl?: string;
      groupId?: number;
      highlighted?: boolean;
      index?: number;
      lastFocusedWindow?: boolean;
      muted?: boolean;
      pinned?: boolean;
      status?: string;
      title?: string;
      url?: string | string[];
      windowId?: number;
      windowType?: string;
    }

    function query(queryInfo: QueryInfo, callback: (tabs: Tab[]) => void): void;
    function create(createProperties: object, callback?: (tab: Tab) => void): void;
    function update(tabId: number | undefined, updateProperties: object, callback?: (tab?: Tab) => void): void;
    function remove(tabIds: number | number[], callback?: () => void): void;

    const onUpdated: {
      addListener(callback: (tabId: number, changeInfo: any, tab: Tab) => void): void;
      removeListener(callback: (tabId: number, changeInfo: any, tab: Tab) => void): void;
    };

    const onActivated: {
      addListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
      removeListener(callback: (activeInfo: { tabId: number; windowId: number }) => void): void;
    };
  }

  // Scripting API
  namespace scripting {
    interface InjectionTarget {
      tabId?: number;
      frameIds?: number[];
      allFrames?: boolean;
    }

    interface CSSInjection {
      css: string;
      files?: string[];
    }

    interface ScriptInjection {
      files?: string[];
      function?: Function;
      args?: any[];
      world?: 'ISOLATED' | 'MAIN';
    }

    function executeScript(
      target: InjectionTarget,
      injection: ScriptInjection,
      callback?: (results?: any[]) => void
    ): void;

    function insertCSS(
      target: InjectionTarget,
      injection: CSSInjection,
      callback?: () => void
    ): void;

    function removeCSS(
      target: InjectionTarget,
      injection: CSSInjection,
      callback?: () => void
    ): void;
  }

  // Permissions API
  namespace permissions {
    interface Permissions {
      origins?: string[];
      permissions?: string[];
    }

    function contains(permissions: Permissions, callback: (result: boolean) => void): void;
    function request(permissions: Permissions, callback: (granted: boolean) => void): void;
    function remove(permissions: Permissions, callback: (removed: boolean) => void): void;

    const onAdded: {
      addListener(callback: (permissions: Permissions) => void): void;
      removeListener(callback: (permissions: Permissions) => void): void;
    };

    const onRemoved: {
      addListener(callback: (permissions: Permissions) => void): void;
      removeListener(callback: (permissions: Permissions) => void): void;
    };
  }

  // Tab Capture API
  namespace tabCapture {
    interface CaptureOptions {
      audio?: boolean;
      video?: boolean;
      audioConstraints?: MediaTrackConstraints;
      videoConstraints?: MediaTrackConstraints;
    }

    interface CaptureInfo {
      tabId: number;
      status: 'active' | 'stopped' | 'error';
      fullscreen: boolean;
    }

    function capture(options: CaptureOptions, callback: (stream?: MediaStream) => void): void;
    function getCapturedTabs(callback: (result: CaptureInfo[]) => void): void;

    const onStatusChanged: {
      addListener(callback: (info: CaptureInfo) => void): void;
      removeListener(callback: (info: CaptureInfo) => void): void;
    };
  }

  // Offscreen API
  namespace offscreen {
    interface CreateParameters {
      url: string;
      reasons: string[];
      justification: string;
    }

    function createDocument(parameters: CreateParameters, callback?: () => void): void;
    function hasDocument(callback: (result: boolean) => void): void;
    function closeDocument(callback?: () => void): void;
  }

  // Notifications API
  namespace notifications {
    interface NotificationOptions {
      type: 'basic' | 'image' | 'list' | 'progress';
      iconUrl?: string;
      title: string;
      message: string;
      contextMessage?: string;
      priority?: number;
      eventTime?: number;
      buttons?: NotificationButton[];
      imageUrl?: string;
      items?: NotificationItem[];
      progress?: number;
      requireInteraction?: boolean;
      silent?: boolean;
    }

    interface NotificationButton {
      title: string;
      iconUrl?: string;
    }

    interface NotificationItem {
      title: string;
      message: string;
    }

    function create(notificationId: string | undefined, options: NotificationOptions, callback?: (notificationId: string) => void): void;
    function update(notificationId: string, options: NotificationOptions, callback?: (wasUpdated: boolean) => void): void;
    function clear(notificationId: string, callback?: (wasCleared: boolean) => void): void;
    function getAll(callback: (notifications: { [key: string]: NotificationOptions }) => void): void;
    function getPermissionLevel(callback: (level: 'granted' | 'denied') => void): void;

    const onClicked: {
      addListener(callback: (notificationId: string) => void): void;
      removeListener(callback: (notificationId: string) => void): void;
    };

    const onButtonClicked: {
      addListener(callback: (notificationId: string, buttonIndex: number) => void): void;
      removeListener(callback: (notificationId: string, buttonIndex: number) => void): void;
    };

    const onClosed: {
      addListener(callback: (notificationId: string, byUser: boolean) => void): void;
      removeListener(callback: (notificationId: string, byUser: boolean) => void): void;
    };
  }

  // Context Menus API
  namespace contextMenus {
    interface CreateProperties {
      type?: 'normal' | 'checkbox' | 'radio' | 'separator';
      id?: string;
      title?: string;
      checked?: boolean;
      contexts?: string[];
      onclick?: (info: any, tab?: chrome.tabs.Tab) => void;
      parentId?: string | number;
      documentUrlPatterns?: string[];
      targetUrlPatterns?: string[];
      enabled?: boolean;
    }

    function create(createProperties: CreateProperties, callback?: () => void): void;
    function update(id: string | number, updateProperties: object, callback?: () => void): void;
    function remove(id: string | number, callback?: () => void): void;
    function removeAll(callback?: () => void): void;

    const onClicked: {
      addListener(callback: (info: any, tab?: chrome.tabs.Tab) => void): void;
      removeListener(callback: (info: any, tab?: chrome.tabs.Tab) => void): void;
    };
  }

  // Action API (for extension popup)
  namespace action {
    interface BadgeBackgroundColorDetails {
      color: string | number[];
      tabId?: number;
    }

    interface BadgeTextDetails {
      text: string;
      tabId?: number;
    }

    function setBadgeText(details: BadgeTextDetails, callback?: () => void): void;
    function getBadgeText(details: { tabId?: number }, callback: (result: string) => void): void;
    function setBadgeBackgroundColor(details: BadgeBackgroundColorDetails, callback?: () => void): void;
    function getBadgeBackgroundColor(details: { tabId?: number }, callback: (result: string | number[]) => void): void;
    function setTitle(details: { title: string; tabId?: number }, callback?: () => void): void;
    function getTitle(details: { tabId?: number }, callback: (result: string) => void): void;
    function setIcon(details: { imageData?: object; path?: string | object; tabId?: number }, callback?: () => void): void;
    function openPopup(callback?: () => void): void;

    const onClicked: {
      addListener(callback: (tab: chrome.tabs.Tab) => void): void;
      removeListener(callback: (tab: chrome.tabs.Tab) => void): void;
    };
  }
}

// Make chrome available globally
declare const chrome: typeof chrome;