import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import uuid from 'react-native-uuid';

import { storage } from "../config/storage";

type StorageProviderProps = {
  children: ReactNode;
};

type LoginDataProps = {
  id: string;
  title: string;
  email: string;
  password: string;
};

type FormData = {
  title: string;
  email: string;
  password: string;
}

type StorageContextData = {
  data: LoginDataProps[];
  searchListData: LoginDataProps[];
  loadStorageData: () => Promise<void>;
  saveStorageData: (formData: FormData) => Promise<void>;
  filterData: (search: string) => void;
};

const StorageContext = createContext({} as StorageContextData);

const StorageProvider = ({ children }: StorageProviderProps) => {
  const [searchListData, setSearchListData] = useState<LoginDataProps[]>([]);
  const [data, setData] = useState<LoginDataProps[]>([]);
  const { loginsStorageKey } = storage;

  async function loadStorageData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(loginsStorageKey);

      if (data) {
        const logins = JSON.parse(data);

        setData(logins);
        setSearchListData(logins);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function saveStorageData(formData: FormData) {
    try {
      const newLoginData = {
        id: String(uuid.v4()),
        ...formData
      }

      const data = await AsyncStorage.getItem(loginsStorageKey);
      const logins = data ? JSON.parse(data) : [];

      const newLogin = [...logins, newLoginData];
      await AsyncStorage.setItem(loginsStorageKey, JSON.stringify(newLogin));
    } catch (error) {
      console.error(error.message);
      throw new Error(error);
    }
  }

  function filterData(search: string) {
    const filteredLoginData = data.filter(login =>
      login.title.startsWith(search.trim()));

    setSearchListData(filteredLoginData);
  }

  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <StorageContext.Provider value={{ data, searchListData, loadStorageData, saveStorageData, filterData }}>
      {children}
    </StorageContext.Provider>
  );
}

const useStorageData = () => {
  return useContext(StorageContext);
};

export { StorageProvider, useStorageData };
