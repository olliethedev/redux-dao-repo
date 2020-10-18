import ApiError from './ApiError';

class DataModel {
  constructor(data, loading = false, error = false) {
    this.data = data;
    this.loading = loading;
    this.error = error;
  }

  static initLoading() {
    return new DataModel(null, true, false);
  }

  static error(code, message) {
    return new DataModel(false, false, new ApiError(message, code));
  }

  static canFetch(m) {
    return !m.data && !m.loading && !m.error;
  }
}
export default DataModel;
