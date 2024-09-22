
import { createLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';

export const getRecord = createLdsTestWireAdapter(jest.fn());
export const getRecords = createLdsTestWireAdapter(jest.fn());
export const getRecordCreateDefaults = createLdsTestWireAdapter(jest.fn());
export const updateRecord = jest.fn().mockResolvedValue({});
export const createRecord = jest.fn().mockResolvedValue({});
export const deleteRecord = jest.fn().mockResolvedValue();
export const generateRecordInputForCreate = jest.fn();
export const generateRecordInputForUpdate = jest.fn();
export const createRecordInputFilteredByEditedFields = jest.fn();
export const getRecordInput = jest.fn();
export const getRecordNotifyChange = createLdsTestWireAdapter(jest.fn());
export const refresh = jest.fn().mockResolvedValue();
export const getRecordUi = createLdsTestWireAdapter(jest.fn());
export const notifyRecordUpdateAvailable = jest.fn().mockResolvedValue();
